import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateJobSeekerProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  location: z.string().max(100, "Location must be at most 100 characters").optional(),
  skills: z.array(z.string().min(1)).optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  resumeUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type UpdateJobSeekerProfileInput = z.infer<typeof updateJobSeekerProfileSchema>;
