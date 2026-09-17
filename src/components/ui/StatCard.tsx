import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-[var(--color-ink-muted)]">{label}</p>
        {Icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              accent ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]" : "bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)]"
            }`}
          >
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[28px] leading-none text-[var(--color-ink)]">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">{hint}</p>}
    </Card>
  );
}
