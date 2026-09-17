import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function MarketingFooter() {
  return (
    <footer id="iletisim" className="bg-[var(--color-ink)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-center sm:flex-row sm:justify-between sm:text-left sm:px-8">
        <div>
          <Logo size={28} />
          <p className="mt-2 max-w-xs text-sm text-white/50">
            Berberler ve kuaförler için randevu, müşteri ve çalışan yönetimi.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          <Link href="/login" className="hover:text-white">
            Giriş Yap
          </Link>
          <Link href="/register" className="hover:text-white">
            İşletmenizi Kaydedin
          </Link>
          <a href="#ozellikler" className="hover:text-white">
            Özellikler
          </a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-white/30">© {new Date().getFullYear()} SalonOS. Tüm hakları saklıdır.</p>
    </footer>
  );
}
