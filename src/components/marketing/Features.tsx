import Image from "next/image";
import { CalendarDays, Users, MessageCircle } from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const FEATURES = [
  {
    image: MARKETING_IMAGES.interior,
    icon: CalendarDays,
    title: "Randevu Yönetimi",
    description: "Günlük, haftalık görünümle kim ne zaman geliyor bir bakışta görün. Çakışan randevu asla oluşmaz.",
  },
  {
    image: MARKETING_IMAGES.womenCut,
    icon: Users,
    title: "Müşteri Takibi",
    description: "Her müşterinin geçmişi, tercih ettiği çalışan ve harcaması elinizin altında.",
  },
  {
    image: MARKETING_IMAGES.styling,
    icon: MessageCircle,
    title: "WhatsApp'a Hazır Altyapı",
    description: "Müşterileriniz WhatsApp'tan yazdığında randevu otomatik oluşsun — altyapı şimdiden hazır.",
  },
];

export function Features() {
  return (
    <section id="ozellikler" className="bg-[var(--color-bg)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">Özellikler</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
            İşinizi kolaylaştıran <span className="italic text-[var(--color-accent-dark)]">her şey</span> tek yerde
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ image, icon: Icon, title, description }) => (
            <div
              key={title}
              className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]">
                  <Icon size={18} />
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-[var(--color-ink)]">{title}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
