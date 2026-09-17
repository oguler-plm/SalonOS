"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, Scissors, UserRound, Settings } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/appointments", label: "Randevular", icon: CalendarDays },
  { href: "/customers", label: "Müşteriler", icon: Users },
  { href: "/services", label: "Hizmetler", icon: Scissors },
  { href: "/employees", label: "Çalışanlar", icon: UserRound },
  { href: "/settings", label: "Ayarlar", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-3xl justify-between px-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] transition-colors ${
                  active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-6 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
                )}
                <Icon size={19} strokeWidth={active ? 2.25 : 1.75} />
                <span className={active ? "font-medium" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
