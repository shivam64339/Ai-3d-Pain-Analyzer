import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const inputSchema = z.object({
  bodyPart: z.string().min(1).max(100),
  gender: z.enum(["male", "female"]).optional(),
  ageRange: z.string().max(10).optional(),
  additionalSymptoms: z.string().max(500).optional(),
});

export const analyzePain = async ({
  data,
}: {
  data: z.infer<typeof inputSchema>;
}) => {
  const payload = inputSchema.parse(data);

  const { data: result, error } = await supabase.functions.invoke("analyze-pain", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "AI analysis failed");
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  return result;
};
