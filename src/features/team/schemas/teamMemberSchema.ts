import { z } from "zod";

const orgRoles = [
  "COMPANY_ADMIN",
  "PRODUCT_MANAGER",
  "CONTENT_CREATOR",
  "APPROVER",
  "PUBLISHER",
  "ANALYST",
] as const;

export const productAccessSchema = z.object({
  projectId: z.string().min(1),
  manageAll: z.boolean(),
  social: z.boolean(),
  marketing: z.boolean(),
  leads: z.boolean(),
  crm: z.boolean(),
});

export const teamMemberSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(orgRoles),
    status: z.enum(["active", "suspended"]),
    productAccess: z.array(productAccessSchema),
  })
  .superRefine((value, ctx) => {
    if (value.role !== "COMPANY_ADMIN" && value.productAccess.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["productAccess"],
        message: "Assign at least one product.",
      });
    }

    value.productAccess.forEach((item, index) => {
      if (
        !item.manageAll &&
        !item.social &&
        !item.marketing &&
        !item.leads &&
        !item.crm
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["productAccess", index],
          message: "Turn on at least one module, or choose manage everything.",
        });
      }
    });
  });

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
