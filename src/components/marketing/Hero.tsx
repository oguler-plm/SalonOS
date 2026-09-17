import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, MessageCircleMore, ShieldCheck } from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const PILLS = [
  { icon: CalendarCheck, label: "Çakışmasız Randevu" },
  { icon: MessageCircleMore, label: "WhatsApp'a Hazır" },
  { icon: ShieldCheck, label: "Verileriniz Güvende" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-[var(--color-ink)] sm:items-center">
      <Image
        src={MARKETING_IMAGES.hero}
        alt="Berber koltuğu ve ayna"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/70 to-[var(--color-ink)]/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)]/80 via-transparent to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-40 sm:px-8 sm:pb-28">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
          Berberler &amp; Kuaförler İçin
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl italic leading-[1.1] text-white sm:text-6xl">
          Randevu defterine değil, <span className="text-[var(--color-accent-soft)]">SalonOS&apos;a</span> güvenin.
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">
          Günlük randevu, müşteri ve çalışan yönetimini tek ekranda toplayın. WhatsApp, telefon ve kağıt ajandayla
          uğraşmayı bırakın — işletmeniz 10 saniyede özetlensin.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-semibold text-[var(--color-accent-ink)] shadow-lg shadow-black/20 transition-transform active:scale-[0.98]"
          >
            İşletmenizi Ücretsiz Kaydedin
          </Link>
          <a
            href="#ozellikler"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Nasıl Çalıştığını Gör
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
          {PILLS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-white/70">
              <Icon size={16} className="text-[var(--color-accent-soft)]" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
