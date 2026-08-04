import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Edge function v5 called');
    
    const body = await req.json();
    console.log('Request body keys:', Object.keys(body));
    
    // Support multiple parameter formats for backwards compatibility
    const { images, imageBase64, imageUrl } = body;
    
    let imageArray: string[] = [];
    
    if (images && Array.isArray(images) && images.length > 0) {
      imageArray = images;
    } else if (imageBase64) {
      imageArray = [imageBase64];
    } else if (imageUrl) {
      // Fetch image from URL and convert to base64
      try {
        const imgResponse = await fetch(imageUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        imageArray = [base64];
      } catch (e) {
        console.error('Failed to fetch image from URL:', e);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch image from URL' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('Number of images:', imageArray.length);
    
    if (imageArray.length === 0) {
      console.log('No images provided');
      return new Response(
        JSON.stringify({ error: 'No images provided. Please provide images, imageBase64, or imageUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('OpenAI API key found, length:', openaiApiKey.length);

    // Build the content array with all images
    const imageContent = imageArray.map((base64: string, index: number) => {
      console.log(`Image ${index + 1} base64 length:`, base64?.length || 0);
      return {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
          detail: 'high'
        }
      };
    });

    const pageInfo = imageArray.length > 1 
      ? `You are looking at ${imageArray.length} images/pages of a recipe. Please combine all the information from all pages into a single complete recipe.`
      : 'You are looking at an image of a recipe.';

    console.log('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that extracts recipe information from images. ${pageInfo}

Extract the recipe details and return them in the following JSON format:
{
  "title": "Recipe name",
  "author": "Recipe author/source if visible, otherwise empty string",
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
  "story": "Any story or notes about the recipe if mentioned, otherwise empty string"
}

IMPORTANT:
- If viewing multiple pages, make sure to include ALL ingredients and ALL instructions from ALL pages
- Merge any duplicate information intelligently
- Keep the instructions in the correct order
- If information is missing, make reasonable assumptions or leave empty
- The "servings" field MUST be a single integer, never a range or text
- Return ONLY the JSON object, no additional text`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: imageArray.length > 1 
                  ? `Please extract the complete recipe from these ${imageArray.length} images/pages and combine all the information into one recipe.`
                  : 'Please extract the recipe from this image.'
              },
              ...imageContent
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to process image with AI: ' + errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('OpenAI response received, content length:', content?.length || 0);

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let recipe: RecipeData;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0]);
      } else {
        recipe = JSON.parse(content);
      }
      console.log('Recipe parsed successfully:', recipe.title);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse recipe data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The recipes.servings DB column is an integer; the model sometimes
    // returns strings like "4-6" — coerce to the first number found.
    if (typeof (recipe as any).servings !== 'number') {
      const match = String((recipe as any).servings ?? '').match(/\d+/);
      (recipe as any).servings = match ? parseInt(match[0], 10) : null;
    }

    return new Response(
      JSON.stringify({ recipe }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
