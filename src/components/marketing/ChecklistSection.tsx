import Image from "next/image";
import { Check } from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const ITEMS = [
  "Çakışan randevu oluşturulmasını otomatik engeller",
  "Mobil öncelikli tasarım — telefonunuzdan rahatça kullanın",
  "Birden fazla çalışan, farklı çalışma saatleri ve izinler",
  "Her işletmenin verisi birbirinden tamamen izole (multi-tenant güvenlik)",
  "Günlük ciro, bekleyen randevu ve yeni müşteri özetini tek bakışta görün",
];

export function ChecklistSection() {
  return (
    <section id="nasil-calisir" className="bg-[var(--color-bg)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-[var(--shadow-elevated)]">
          <Image
            src={MARKETING_IMAGES.brickWall}
            alt="Berber dükkanı iç mekan"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
            Neden SalonOS
          </p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
            Basit, hızlı, <span className="italic text-[var(--color-accent-dark)]">güvenilir</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="text-[var(--color-ink-muted)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
