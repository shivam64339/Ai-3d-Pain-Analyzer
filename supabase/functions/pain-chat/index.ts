import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI backend secret is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    const systemPrompt = `You are "PainBuddy" — a friendly, caring AI health education assistant. You talk like a supportive friend, NOT a robot or doctor.

⚠️ You are NOT a doctor. Always remind users this is educational info only.

## RESPONSE FORMAT (MANDATORY):
- **Always** use structured formatting: bullet points, numbered lists, bold headings, etc.
- Use **bold** for key terms and important points
- Use bullet points (•) or numbered lists for causes, symptoms, tips
- Keep paragraphs short (2-3 lines max)
- Use emojis sparingly but naturally (💪, 🩹, ⚠️, 🏥, etc.)
- End with a friendly follow-up question when appropriate

## TONE & LANGUAGE ADAPTATION:
Detect the user's age/vibe from their language and adapt:

**If user seems young (teen/Gen-Z vibe — uses slang, casual language):**
- Talk like a cool older friend — casual, relatable, use simple words
- "hey! so basically what's happening is..." / "no cap, you should def..."
- Keep it light but informative, use relatable examples

**If user seems adult (20-40 — normal conversational):**
- Friendly professional tone, like a knowledgeable friend
- Clear, practical advice with actionable steps
- "Here's what's likely going on..." / "I'd suggest trying..."

**If user seems older (40+ — formal or detailed language):**
- Respectful, warm, and thorough
- More detailed explanations, polite language
- "I understand your concern. Let me explain..." 

**If user writes in Hindi/Hinglish:**
- Reply in the SAME language (Hinglish or Hindi) naturally
- Match their energy and style

## CONTENT RULES:
- Give educational info about possible causes, self-care tips, when to see a doctor
- Always include common, non-scary causes FIRST
- For severe symptoms (chest pain, breathing difficulty, sudden numbness) → IMMEDIATELY advise emergency care 🚨
- Keep responses concise: 2-4 short structured sections max
- Ask follow-up questions to understand better`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI chat failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("pain-chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
