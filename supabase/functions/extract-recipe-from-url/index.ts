import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FETCH_TIMEOUT_MS = 20000;
const MAX_HTML_CHARS = 1500000;
// When schema.org data is present it carries the recipe, so the page text is
// only along for story/description colour and can be trimmed much harder.
const MAX_TEXT_CHARS_WITH_JSONLD = 8000;
const MAX_TEXT_CHARS_PLAIN = 24000;

interface RecipeData {
  title: string;
  author: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: string;
  dietary: string[];
  tags: string[];
  story: string;
}

// Reject anything that isn't a public web page: the function holds a service
// role and must not be usable as a probe into private network space.
function parsePublicUrl(raw: unknown): URL {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Please paste a recipe link.');
  }
  let candidate = raw.trim();
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(candidate);
  if (hasScheme && !/^https?:\/\//i.test(candidate)) {
    // file:, javascript:, data: and friends — never rewrite these into an
    // https URL, reject them outright.
    throw new Error('Only http and https links can be imported.');
  }
  if (!hasScheme) candidate = `https://${candidate}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("That doesn't look like a web address.");
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https links can be imported.');
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const isPrivate =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === '::1' ||
    host.startsWith('fd') ||
    host.startsWith('fe80:') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^0\./.test(host);

  // A bare hostname with no dot ("intranet", "router") only resolves inside a
  // private network; public recipe sites always have a domain.
  const isBareHostname = !host.includes('.') && !host.includes(':');

  if (isPrivate || isBareHostname) throw new Error('That address is not reachable.');
  return url;
}

// Walks a parsed JSON-LD blob looking for the schema.org Recipe node. Sites
// nest it in @graph, mainEntity, or a bare array, so this recurses.
function findRecipeNode(node: unknown, depth = 0): Record<string, unknown> | null {
  if (!node || depth > 6) return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findRecipeNode(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }

  if (typeof node !== 'object') return null;
  const obj = node as Record<string, unknown>;

  const rawType = obj['@type'];
  const types = Array.isArray(rawType) ? rawType : [rawType];
  if (types.some((t) => typeof t === 'string' && t.toLowerCase() === 'recipe')) {
    return obj;
  }

  for (const key of ['@graph', 'mainEntity', 'mainEntityOfPage', 'itemListElement']) {
    const hit = findRecipeNode(obj[key], depth + 1);
    if (hit) return hit;
  }
  return null;
}

function extractJsonLdRecipe(html: string): Record<string, unknown> | null {
  const blocks = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const block of blocks) {
    const raw = block[1]?.trim().replace(/^﻿/, '');
    if (!raw) continue;
    try {
      const hit = findRecipeNode(JSON.parse(raw));
      if (hit) return hit;
    } catch {
      // Malformed JSON-LD is common in the wild — skip and keep looking.
    }
  }
  return null;
}

// Only the keys worth spending tokens on; values stay raw so the model can
// untangle HowToSection/HowToStep nesting itself.
const JSONLD_KEYS = [
  'name', 'author', 'description', 'recipeIngredient', 'recipeInstructions',
  'prepTime', 'cookTime', 'totalTime', 'recipeYield', 'recipeCategory',
  'recipeCuisine', 'keywords', 'suitableForDiet', 'nutrition', 'datePublished',
];

function pruneJsonLd(node: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of JSONLD_KEYS) {
    if (node[key] !== undefined && node[key] !== null && node[key] !== '') {
      out[key] = node[key];
    }
  }
  return out;
}

function metaContent(html: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]*>`,
    'i'
  );
  const tag = html.match(pattern)?.[0];
  if (!tag) return null;
  return tag.match(/content=["']([^"']+)["']/i)?.[1]?.trim() || null;
}

function firstImageUrl(recipeNode: Record<string, unknown> | null, html: string, base: URL): string | null {
  const fromNode = (value: unknown, depth = 0): string | null => {
    if (!value || depth > 3) return null;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      for (const item of value) {
        const hit = fromNode(item, depth + 1);
        if (hit) return hit;
      }
      return null;
    }
    if (typeof value === 'object') {
      return fromNode((value as Record<string, unknown>).url, depth + 1);
    }
    return null;
  };

  const candidate =
    (recipeNode ? fromNode(recipeNode.image) : null) ||
    metaContent(html, 'og:image') ||
    metaContent(html, 'twitter:image');

  if (!candidate) return null;
  try {
    const resolved = new URL(candidate, base);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:'
      ? resolved.toString()
      : null;
  } catch {
    return null;
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|header)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&frac12;/gi, '½')
    .replace(/&frac14;/gi, '¼')
    .replace(/&frac34;/gi, '¾')
    .replace(/&deg;/gi, '°')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/\n[ ]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sourceNameFrom(html: string, url: URL): string {
  return (
    metaContent(html, 'og:site_name') ||
    url.hostname.replace(/^www\./, '')
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const fail = (message: string, status: number) =>
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = await req.json();

    let url: URL;
    try {
      url = parsePublicUrl(body?.url);
    } catch (e) {
      return fail((e as Error).message, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return fail('OpenAI API key not configured', 500);
    }

    console.log('Importing recipe from:', url.hostname);

    let html: string;
    try {
      const pageResponse = await fetch(url.toString(), {
        redirect: 'follow',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          // Recipe sites routinely 403 unknown agents.
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!pageResponse.ok) {
        return fail(
          `That site wouldn't share the page (error ${pageResponse.status}). Try a screenshot instead.`,
          502
        );
      }

      const contentType = pageResponse.headers.get('content-type') || '';
      if (contentType && !/text\/html|application\/xhtml|text\/plain/i.test(contentType)) {
        return fail("That link isn't a web page we can read. Paste the recipe's page link.", 400);
      }

      html = (await pageResponse.text()).slice(0, MAX_HTML_CHARS);
    } catch (e) {
      console.error('Page fetch failed:', e);
      const timedOut = (e as Error)?.name === 'TimeoutError';
      return fail(
        timedOut
          ? 'That site took too long to answer. Try again in a moment.'
          : "Couldn't reach that link. Check the address and try again.",
        502
      );
    }

    if (!html.trim()) {
      return fail('That page came back empty.', 502);
    }

    const recipeNode = extractJsonLdRecipe(html);
    const pageText = htmlToText(html).slice(
      0,
      recipeNode ? MAX_TEXT_CHARS_WITH_JSONLD : MAX_TEXT_CHARS_PLAIN
    );
    const imageUrl = firstImageUrl(recipeNode, html, url);
    const sourceName = sourceNameFrom(html, url);
    const pageTitle = metaContent(html, 'og:title') ||
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
      '';

    console.log('Structured recipe data found:', !!recipeNode, '| text chars:', pageText.length);

    if (!recipeNode && pageText.length < 200) {
      return fail(
        "That page didn't have readable recipe text — it may need JavaScript. Try a screenshot instead.",
        422
      );
    }

    const sourceBlock = [
      `PAGE URL: ${url.toString()}`,
      `SITE: ${sourceName}`,
      pageTitle ? `PAGE TITLE: ${pageTitle}` : '',
      recipeNode
        ? `SCHEMA.ORG RECIPE DATA (authoritative — prefer this):\n${JSON.stringify(pruneJsonLd(recipeNode))}`
        : '',
      `PAGE TEXT:\n${pageText}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.6-terra',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that extracts recipe information from a web page. You are given the page's text, and often its schema.org structured data.

Extract the recipe details and return them in the following JSON format:
{
  "title": "Recipe name",
  "author": "The recipe's original author or publication as credited on the page, otherwise empty string",
  "category": "One of: Appetizers, Main Dishes, Side Dishes, Soups & Stews, Salads, Desserts, Baked Goods, Breakfast, Beverages, Sauces & Condiments",
  "prepTime": "Prep time (e.g., '15 min')",
  "cookTime": "Cook time (e.g., '30 min')",
  "servings": number of servings as integer,
  "description": "A brief appetizing description of the dish",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity", ...],
  "instructions": ["step 1", "step 2", ...],
  "difficulty": "Easy, Medium, or Hard",
  "dietary": ["any applicable: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Paleo, Low-Carb"],
  "tags": ["relevant tags like 'comfort food', 'quick meal', 'holiday', etc."],
  "story": "The author's headnote or backstory about the dish if the page has one, otherwise empty string"
}

IMPORTANT:
- When schema.org data is present, trust it over the surrounding page text
- Web pages carry navigation, ads, newsletter prompts, comments, and lists of other recipes — ignore all of it and extract only the single main recipe
- Convert ISO 8601 durations (PT1H30M) to friendly text ('1 hr 30 min')
- Instructions must be plain sentences with no leading step numbers, and stay in order
- Ingredients keep their quantities exactly as written
- Never invent ingredients, steps, or a backstory that isn't on the page — leave fields empty instead
- The "servings" field MUST be a single integer, never a range or text
- Return ONLY the JSON object, no additional text`,
          },
          {
            role: 'user',
            content: `Extract the recipe from this web page.\n\n${sourceBlock}`,
          },
        ],
        max_completion_tokens: 8192,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return fail('Failed to read that page with AI: ' + errorData, 500);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fail('No response from AI', 500);

    let recipe: RecipeData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      recipe = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error('Failed to parse AI response:', content);
      return fail('Failed to parse recipe data', 500);
    }

    if (!recipe?.title && !(recipe?.ingredients?.length)) {
      return fail(
        "We couldn't find a recipe on that page. Check the link, or try a screenshot instead.",
        422
      );
    }

    // The recipes.servings DB column is an integer; the model sometimes
    // returns strings like "4-6" — coerce to the first number found.
    if (typeof (recipe as any).servings !== 'number') {
      const match = String((recipe as any).servings ?? '').match(/\d+/);
      (recipe as any).servings = match ? parseInt(match[0], 10) : null;
    }

    console.log('Recipe parsed successfully:', recipe.title);

    return new Response(
      JSON.stringify({
        recipe,
        source: {
          url: url.toString(),
          name: sourceName,
          author: recipe.author || '',
          image: imageUrl,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return fail((error as Error).message || 'An unexpected error occurred', 500);
  }
});
