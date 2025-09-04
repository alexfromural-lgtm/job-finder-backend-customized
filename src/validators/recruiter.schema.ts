import { z } from "zod";
import { signupSchema } from "./jobseeker.schema";

export const recruiterSignupSchema = signupSchema.extend({
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.url("Invalid URL").optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
});

export type RecruiterSignupInput = z.infer<typeof recruiterSignupSchema>;