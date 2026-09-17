"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginAction(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "E-posta veya şifre hatalı";
    }
    // next/navigation's redirect() (used internally by signIn on success) throws —
    // that must propagate, not be swallowed as a login failure.
    throw error;
  }
}
