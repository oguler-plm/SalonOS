import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-ink)] px-4 py-12">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={48} withWordmark={false} />
          <h1 className="mt-4 font-display text-2xl italic text-white">
            Salon<span className="text-[var(--color-accent-soft)]">OS</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/50">Randevu ve müşteri yönetimi, tek yerde.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--color-surface)] p-7 shadow-[var(--shadow-elevated)]">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-white/30">Berberler ve kuaförler için tasarlandı</p>
      </div>
    </div>
  );
}
