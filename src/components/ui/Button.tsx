import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-accent-soft)] shadow-[var(--shadow-card)] hover:bg-[#332a20] active:scale-[0.98] disabled:bg-[var(--color-ink-faint)] disabled:text-white/70",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-ink)] ring-1 ring-inset ring-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] active:scale-[0.98]",
  danger:
    "bg-[var(--color-danger)] text-white shadow-[var(--shadow-card)] hover:brightness-95 active:scale-[0.98] disabled:opacity-50",
  ghost: "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_CLASS[variant]} ${className}`}
    />
  );
}
