import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-[var(--color-ink)]">İşletmenizi Kaydedin</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">30 saniyede kuruluma başlayın.</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-[var(--color-ink-muted)]">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="font-medium text-[var(--color-accent-dark)] underline underline-offset-2">
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
