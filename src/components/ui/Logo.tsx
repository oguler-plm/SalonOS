export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19.25" stroke="var(--color-accent)" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="15.5" fill="var(--color-ink)" />
      <text
        x="20"
        y="26.5"
        textAnchor="middle"
        fontFamily="var(--font-display), Fraunces, serif"
        fontStyle="italic"
        fontWeight="600"
        fontSize="18"
        fill="var(--color-accent-soft)"
      >
        S
      </text>
    </svg>
  );
}

export function Logo({ size = 36, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-lg leading-none tracking-tight text-[var(--color-ink)]">
          Salon<span className="italic text-[var(--color-accent)]">OS</span>
        </span>
      )}
    </span>
  );
}
