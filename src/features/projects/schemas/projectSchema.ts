import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  social: z.boolean(),
  marketing: z.boolean(),
  leads: z.boolean(),
  crm: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
