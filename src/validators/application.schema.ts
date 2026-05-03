import { z } from "zod";

export const applicationSchema = z.object({
  coverLetter: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
