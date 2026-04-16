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

    const { bodyPart, gender, ageRange, additionalSymptoms } = await req.json();

    const systemPrompt = `You are an intelligent medical assistant AI designed to analyze human pain descriptions.
You are NOT a doctor. Your role is purely educational.

Your task is to classify and analyze pain based on structured user input.

CLASSIFICATION CATEGORIES:
- Muscle Pain: sore, tight, stiff, after workout; increases with movement, reduces with rest
- Bone Pain: deep pain, constant, inside ache; persistent and not movement-dependent
- Nerve Pain: burning, tingling, numbness, electric shock; sharp, radiating, sudden
- Joint Pain: swelling, stiffness, bending pain; located at joints, movement-specific
- Inflammatory / Internal Pain: redness, warmth, fever, swelling; often with additional symptoms

Return response in STRICT JSON format:
{
  "bodyPart": "Human-readable body part name",
  "primary_type": "Most likely pain category",
  "secondary_type": "Optional secondary category or null",
  "pain_nature": "sharp / dull / burning / throbbing / tingling etc.",
  "severity": "low | medium | high | critical",
  "confidence_score": "percentage 0-100%",
  "possibleCauses": ["cause1", "cause2", "cause3", "cause4"],
  "symptoms": ["symptom1", "symptom2", "symptom3", "symptom4"],
  "precautions": ["precaution1", "precaution2", "precaution3"],
  "followUpQuestions": ["question1", "question2", "question3"],
  "reasoning": "Short explanation based on symptoms detected",
  "warning": "Safety warning if serious symptoms detected, otherwise 'none'",
  "summary": "Brief educational overview of pain in this area"
}

RULES:
- Keep output simple and user-friendly
- Do NOT give medical diagnosis — only suggest possibilities
- Prioritize safety in warnings (chest pain, numbness, severe pain → always warn)
- Include common, non-alarming causes first
- Include self-care tips in precautions
- Follow-up questions should be ones the user could ask their doctor
- Respond ONLY with valid JSON, no other text`;

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
          {
            role: "user",
            content: `The user is a ${gender ?? "person"} in the age range ${ageRange ?? "unknown"} experiencing pain in their ${bodyPart}.${additionalSymptoms ? ` Additional context: ${additionalSymptoms}` : ""} Provide educational analysis appropriate for their age and gender.`,
          },
        ],
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
      return new Response(JSON.stringify({ error: "AI analysis failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No response from AI." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-pain function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
