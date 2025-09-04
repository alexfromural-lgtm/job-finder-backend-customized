import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  location: z.string().min(1, "Location is required"),
  salaryRange: z.string().optional(),
  category: z.string().optional(),
});