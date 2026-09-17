import type { ComponentPropsWithoutRef, ElementType } from "react";

type CardProps<T extends ElementType> = { as?: T; className?: string } & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "className"
>;

export function Card<T extends ElementType = "div">({ as, className = "", ...props }: CardProps<T>) {
  const Component = (as || "div") as ElementType;
  return (
    <Component
      {...props}
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${className}`}
    />
  );
}

type BadgeTone = "neutral" | "accent" | "success" | "info" | "warning" | "danger";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)]",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}
