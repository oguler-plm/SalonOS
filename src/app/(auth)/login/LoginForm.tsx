"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="E-posta" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Şifre" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
