import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function MarketingNav({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo size={32} />
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
          <a href="#ozellikler" className="transition-colors hover:text-white">
            Özellikler
          </a>
          <a href="#nasil-calisir" className="transition-colors hover:text-white">
            Nasıl Çalışır
          </a>
          <a href="#iletisim" className="transition-colors hover:text-white">
            İletişim
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-transform active:scale-95"
            >
              Panele Git
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white sm:block"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-ink)] transition-transform active:scale-95"
              >
                Ücretsiz Başlayın
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
