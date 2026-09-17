import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-[var(--color-ink)]">Tekrar Hoş Geldiniz</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Devam etmek için giriş yapın.</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-[var(--color-ink-muted)]">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="font-medium text-[var(--color-accent-dark)] underline underline-offset-2">
          İşletmenizi kaydedin
        </Link>
      </p>
    </div>
  );
}
