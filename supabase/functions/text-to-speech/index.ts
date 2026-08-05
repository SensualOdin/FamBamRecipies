import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Kitchen Mode "sous chef" narration via ElevenLabs.
// Requires ELEVENLABS_API_KEY secret; voice/model overridable via secrets.
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — warm, clear
const DEFAULT_MODEL_ID = 'eleven_flash_v2_5';    // low latency, cheap

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      // Client treats this as "use the browser voice instead"
      return new Response(
        JSON.stringify({ error: 'TTS not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'TTS failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    return new Response(
      JSON.stringify({ error: error.message || 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
