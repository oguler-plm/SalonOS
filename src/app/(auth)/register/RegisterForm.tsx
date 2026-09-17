"use client";

import { useActionState } from "react";
import { registerAction } from "./actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const [error, formAction, isPending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="İşletme adı" htmlFor="businessName">
        <Input id="businessName" name="businessName" type="text" placeholder="Örn. Ahmet Erkek Kuaförü" required />
      </Field>
      <Field label="Adınız Soyadınız" htmlFor="ownerName">
        <Input id="ownerName" name="ownerName" type="text" autoComplete="name" required />
      </Field>
      <Field label="E-posta" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Şifre" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Oluşturuluyor..." : "İşletmeni Oluştur"}
      </Button>
    </form>
  );
}
