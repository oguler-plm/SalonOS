import Image from "next/image";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const SEGMENTS = [
  { image: MARKETING_IMAGES.menCut, label: "Erkek Berberi" },
  { image: MARKETING_IMAGES.modernSalon, label: "Kadın Kuaförü" },
  { image: MARKETING_IMAGES.brickWall, label: "Güzellik Salonu" },
];

export function SegmentGallery() {
  return (
    <section className="bg-[var(--color-ink)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
            Her İşletme İçin
          </p>
          <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
            Sektörünüz ne olursa olsun, <span className="italic text-[var(--color-accent-soft)]">aynı kolaylık</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {SEGMENTS.map(({ image, label }) => (
            <div key={label} className="group relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image
                src={image}
                alt={label}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <p className="absolute bottom-5 left-5 font-display text-xl italic text-white">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
