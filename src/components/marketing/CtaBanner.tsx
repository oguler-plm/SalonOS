import Image from "next/image";
import Link from "next/link";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-24 sm:py-32">
      <Image
        src={MARKETING_IMAGES.interior}
        alt="Berber salonu"
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/85 to-[var(--color-ink)]/60" />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-display text-3xl italic text-white sm:text-5xl">
          İşletmenizi bugün <span className="text-[var(--color-accent-soft)]">dijitalleştirin</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/65">
          Kurulum 30 saniye sürer, kredi kartı gerekmez. Hemen ilk çalışanınızı ve hizmetinizi ekleyin.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-sm font-semibold text-[var(--color-accent-ink)] shadow-lg shadow-black/30 transition-transform active:scale-[0.98]"
        >
          Ücretsiz Başlayın
        </Link>
      </div>
    </section>
  );
}
