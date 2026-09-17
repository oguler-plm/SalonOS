import { z } from "zod";

export const registerSchema = z.object({
  businessName: z.string().trim().min(2, "İşletme adı en az 2 karakter olmalı"),
  ownerName: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı"),
  email: z.email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export type LoginInput = z.infer<typeof loginSchema>;
