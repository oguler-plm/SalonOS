import { z } from "zod";

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1, "Ad gerekli"),
  lastName: z.string().trim().min(1, "Soyad gerekli"),
  phone: z.string().trim().min(6, "Geçerli bir telefon numarası girin"),
  notes: z.string().trim().optional().or(z.literal("")),
  preferredEmployeeId: z.string().optional().or(z.literal("")),
  preferredServiceId: z.string().optional().or(z.literal("")),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
