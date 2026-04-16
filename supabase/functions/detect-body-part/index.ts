import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.24.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Granular body part taxonomy with detailed sub-parts
const BODY_PARTS = [
  // Head & Face
  { name: "forehead", label: "Forehead" },
  { name: "left_eye", label: "Left Eye" },
  { name: "right_eye", label: "Right Eye" },
  { name: "nose", label: "Nose" },
  { name: "left_ear", label: "Left Ear" },
  { name: "right_ear", label: "Right Ear" },
  { name: "left_cheek", label: "Left Cheek" },
  { name: "right_cheek", label: "Right Cheek" },
  { name: "mouth", label: "Mouth" },
  { name: "chin", label: "Chin" },
  { name: "jaw", label: "Jaw" },
  { name: "scalp", label: "Scalp / Top of Head" },
  { name: "left_temple", label: "Left Temple" },
  { name: "right_temple", label: "Right Temple" },
  // Neck
  { name: "front_neck", label: "Front of Neck (Throat)" },
  { name: "back_neck", label: "Back of Neck (Nape)" },
  { name: "left_side_neck", label: "Left Side of Neck" },
  { name: "right_side_neck", label: "Right Side of Neck" },
  // Shoulders
  { name: "left_shoulder", label: "Left Shoulder" },
  { name: "right_shoulder", label: "Right Shoulder" },
  // Chest & Back
  { name: "upper_chest", label: "Upper Chest" },
  { name: "lower_chest", label: "Lower Chest" },
  { name: "left_chest", label: "Left Chest / Pectoral" },
  { name: "right_chest", label: "Right Chest / Pectoral" },
  { name: "sternum", label: "Sternum (Breastbone)" },
  { name: "upper_back", label: "Upper Back" },
  { name: "mid_back", label: "Mid Back" },
  { name: "lower_back", label: "Lower Back (Lumbar)" },
  { name: "left_shoulder_blade", label: "Left Shoulder Blade" },
  { name: "right_shoulder_blade", label: "Right Shoulder Blade" },
  // Abdomen
  { name: "upper_abdomen", label: "Upper Abdomen" },
  { name: "lower_abdomen", label: "Lower Abdomen" },
  { name: "left_abdomen", label: "Left Abdomen" },
  { name: "right_abdomen", label: "Right Abdomen" },
  { name: "navel", label: "Navel (Belly Button)" },
  // Pelvis & Hip
  { name: "left_hip", label: "Left Hip" },
  { name: "right_hip", label: "Right Hip" },
  { name: "groin", label: "Groin" },
  { name: "buttocks", label: "Buttocks" },
  // Arms
  { name: "left_upper_arm", label: "Left Upper Arm (Bicep)" },
  { name: "right_upper_arm", label: "Right Upper Arm (Bicep)" },
  { name: "left_tricep", label: "Left Tricep" },
  { name: "right_tricep", label: "Right Tricep" },
  { name: "left_elbow", label: "Left Elbow" },
  { name: "right_elbow", label: "Right Elbow" },
  { name: "left_forearm", label: "Left Forearm" },
  { name: "right_forearm", label: "Right Forearm" },
  { name: "left_wrist", label: "Left Wrist" },
  { name: "right_wrist", label: "Right Wrist" },
  // Hands & Fingers
  { name: "left_palm", label: "Left Palm" },
  { name: "right_palm", label: "Right Palm" },
  { name: "left_thumb", label: "Left Thumb" },
  { name: "right_thumb", label: "Right Thumb" },
  { name: "left_index_finger", label: "Left Index Finger" },
  { name: "right_index_finger", label: "Right Index Finger" },
  { name: "left_middle_finger", label: "Left Middle Finger" },
  { name: "right_middle_finger", label: "Right Middle Finger" },
  { name: "left_ring_finger", label: "Left Ring Finger" },
  { name: "right_ring_finger", label: "Right Ring Finger" },
  { name: "left_pinky_finger", label: "Left Pinky Finger" },
  { name: "right_pinky_finger", label: "Right Pinky Finger" },
  { name: "left_back_of_hand", label: "Left Back of Hand" },
  { name: "right_back_of_hand", label: "Right Back of Hand" },
  // Legs
  { name: "left_thigh_front", label: "Left Front Thigh (Quad)" },
  { name: "right_thigh_front", label: "Right Front Thigh (Quad)" },
  { name: "left_thigh_back", label: "Left Back Thigh (Hamstring)" },
  { name: "right_thigh_back", label: "Right Back Thigh (Hamstring)" },
  { name: "left_inner_thigh", label: "Left Inner Thigh" },
  { name: "right_inner_thigh", label: "Right Inner Thigh" },
  { name: "left_knee", label: "Left Knee" },
  { name: "right_knee", label: "Right Knee" },
  { name: "left_kneecap", label: "Left Kneecap" },
  { name: "right_kneecap", label: "Right Kneecap" },
  { name: "left_shin", label: "Left Shin" },
  { name: "right_shin", label: "Right Shin" },
  { name: "left_calf", label: "Left Calf" },
  { name: "right_calf", label: "Right Calf" },
  { name: "left_ankle", label: "Left Ankle" },
  { name: "right_ankle", label: "Right Ankle" },
  // Feet & Toes
  { name: "left_heel", label: "Left Heel" },
  { name: "right_heel", label: "Right Heel" },
  { name: "left_sole", label: "Left Sole" },
  { name: "right_sole", label: "Right Sole" },
  { name: "left_top_of_foot", label: "Left Top of Foot" },
  { name: "right_top_of_foot", label: "Right Top of Foot" },
  { name: "left_big_toe", label: "Left Big Toe" },
  { name: "right_big_toe", label: "Right Big Toe" },
  { name: "left_toes", label: "Left Toes" },
  { name: "right_toes", label: "Right Toes" },
] as const;

const inputSchema = z.object({
  imageDataUrl: z.string().min(1),
  gender: z.enum(["male", "female"]),
  ageRange: z.string().max(10),
  clickX: z.number().min(0).max(1),
  clickY: z.number().min(0).max(1),
  mode: z.enum(["click", "hover"]).default("click"),
});

const partNames = BODY_PARTS.map((part) => part.name);
const labelByName = Object.fromEntries(BODY_PARTS.map((part) => [part.name, part.label]));

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

    const body = inputSchema.safeParse(await req.json());
    if (!body.success) {
      return new Response(JSON.stringify({ error: "Invalid detection payload.", details: body.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageDataUrl, gender, ageRange, clickX, clickY, mode } = body.data;

    const model = mode === "hover" ? "google/gemini-2.5-flash-lite" : "google/gemini-2.5-flash";

    const taxonomy = BODY_PARTS.map((part) => `- ${part.name}: ${part.label}`).join("\n");
    const systemPrompt = `You are an expert anatomist analyzing a 3D human body model screenshot. A red target marker (red circle with crosshair) indicates the exact point the user clicked/hovered on.

Your task: Identify the MOST SPECIFIC body part at the red target location.

CRITICAL RULES:
1. Be as GRANULAR as possible. Never say "head" when you can say "forehead", "nose", "left_eye", etc.
2. Never say "hand" when you can say "left_thumb", "right_index_finger", "left_palm", etc.
3. Never say "foot" when you can say "left_heel", "right_big_toe", "left_ankle", etc.
4. Pay close attention to LEFT vs RIGHT from the model's perspective (mirrored from viewer).
5. Pay close attention to FRONT vs BACK (e.g., "left_thigh_front" vs "left_thigh_back").
6. The red target is the ONLY point that matters - identify exactly what's under it.
7. Return ONLY the tool call, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Detailed body part taxonomy (pick the MOST SPECIFIC match):\n${taxonomy}\n\nSubject: ${gender}, age range ${ageRange}\nRed target position: ${(clickX * 100).toFixed(1)}% from left, ${(clickY * 100).toFixed(1)}% from top.\n\nIdentify the exact body part at the red target marker. Be as specific as possible - e.g. if on a finger, specify WHICH finger; if on the face, specify WHICH facial feature.`,
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_body_part",
              description: "Return the most specific body part at the target location.",
              parameters: {
                type: "object",
                properties: {
                  bodyPart: { type: "string", enum: partNames },
                },
                required: ["bodyPart"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "identify_body_part" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI detection failed." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolArgs = result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;

    if (!toolArgs) {
      console.error("Missing tool call:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "No body-part detection returned." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const parsedArgs = JSON.parse(toolArgs);
    const parsedBodyPart = z.object({
      bodyPart: z.enum(partNames as unknown as [string, ...string[]]),
    }).safeParse(parsedArgs);

    if (!parsedBodyPart.success) {
      return new Response(JSON.stringify({ error: "Invalid detection response." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const bodyPart = parsedBodyPart.data.bodyPart;
    return new Response(JSON.stringify({ bodyPart, label: labelByName[bodyPart] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("detect-body-part error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
