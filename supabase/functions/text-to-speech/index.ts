import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

// Kitchen Mode "sous chef" narration via ElevenLabs.
// Requires ELEVENLABS_API_KEY secret; voice/model overridable via secrets.
const DEFAULT_VOICE_ID = 'goT3UYdM9bhm0n2lmKQx'; // George's pick from the voice library
const DEFAULT_MODEL_ID = 'eleven_flash_v2_5';    // low latency, cheap

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');

    // Public health check: booleans only, burns no credits.
    if (req.method === 'GET') {
      if (!apiKey) return json({ configured: false });
      const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID') || DEFAULT_VOICE_ID;
      const [userRes, voiceRes] = await Promise.all([
        fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': apiKey } }),
        fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, { headers: { 'xi-api-key': apiKey } }),
      ]);
      return json({ configured: true, keyValid: userRes.ok, voiceAccessible: voiceRes.ok });
    }

    // Synthesis requires a signed-in user (auth validated here since
    // verify_jwt is off to allow the public GET health check above).
    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return json({ error: 'Sign in to use narration' }, 401);
    }

    if (!apiKey) {
      // Client treats this as "use the browser voice instead"
      return json({ error: 'TTS not configured' }, 503);
    }

    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return json({ error: 'text is required' }, 400);
    }

    // Recipe steps are short; cap length to protect the credit balance.
    const trimmed = text.slice(0, 1200);
    const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID') || DEFAULT_VOICE_ID;
    const modelId = Deno.env.get('ELEVENLABS_MODEL_ID') || DEFAULT_MODEL_ID;

    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: modelId,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!elRes.ok) {
      const detail = await elRes.text();
      console.error('ElevenLabs error:', elRes.status, detail);
      return json({ error: 'TTS failed' }, 502);
    }

    return new Response(elRes.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return json({ error: error.message || 'Unexpected error' }, 500);
  }
});
