import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(2, "Hizmet adı en az 2 karakter olmalı"),
  price: z.number().nonnegative("Fiyat negatif olamaz"),
  durationMinutes: z.number().int().positive("Süre pozitif olmalı"),
  isActive: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial();

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
