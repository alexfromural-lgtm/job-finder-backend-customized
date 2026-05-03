import { z } from "zod";

export const updateRecruiterProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required").optional(),
  companyWebsite: z.url("Invalid URL").optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
});

export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;
