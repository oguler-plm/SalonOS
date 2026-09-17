"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/auth";
import { registerBusiness } from "@/server/services/business.service";
import { AppError } from "@/lib/errors";

export async function registerAction(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  const parsed = registerSchema.safeParse({
    businessName: formData.get("businessName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Girilen veriler geçersiz";
  }

  try {
    await registerBusiness(parsed.data);
  } catch (error) {
    if (error instanceof AppError) {
      return error.message;
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Kayıt oluşturuldu ancak giriş yapılamadı, lütfen giriş sayfasından tekrar deneyin";
    }
    throw error;
  }
}
