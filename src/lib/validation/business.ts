import { z } from "zod";

export const updateBusinessSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsappNumber: z.string().trim().optional().or(z.literal("")),
});

export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
