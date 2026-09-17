export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)]">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>}
    </div>
  );
}
