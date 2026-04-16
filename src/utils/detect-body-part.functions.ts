import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const inputSchema = z.object({
  imageDataUrl: z.string().min(1),
  gender: z.enum(["male", "female"]),
  ageRange: z.string().max(10),
  clickX: z.number().min(0).max(1),
  clickY: z.number().min(0).max(1),
  mode: z.enum(["click", "hover"]).default("click"),
});

const outputSchema = z.object({
  bodyPart: z.string().min(1).max(100),
  label: z.string().min(1).max(100),
});

export const detectBodyPart = async ({
  data,
}: {
  data: z.infer<typeof inputSchema>;
}) => {
  const payload = inputSchema.parse(data);

  const { data: result, error } = await supabase.functions.invoke("detect-body-part", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "AI body-part detection failed");
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  return outputSchema.parse(result);
};
