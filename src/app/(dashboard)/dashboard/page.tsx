import Link from "next/link";
import { CalendarCheck2, CalendarClock, CalendarX2, PlusCircle, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { requireTenant } from "@/lib/session";
import { getDashboardSummary } from "@/server/services/dashboard.service";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/format";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

export default async function DashboardPage() {
  const tenant = await requireTenant();
  const summary = await getDashboardSummary(tenant.businessId);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-[var(--color-ink-muted)]">{greeting()},</p>
          <h1 className="font-display text-2xl text-[var(--color-ink)]">Bugüne bakış</h1>
        </div>
        <Link
          href="/appointments"
          className="text-sm font-medium text-[var(--color-accent-dark)] underline underline-offset-2"
        >
          Tüm randevular
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Bugünkü Randevu" value={String(summary.todayAppointmentCount)} icon={CalendarClock} accent />
        <StatCard label="Tamamlanan" value={String(summary.todayCompletedCount)} icon={CalendarCheck2} />
        <StatCard label="Bekleyen" value={String(summary.todayPendingCount)} icon={CalendarClock} />
        <StatCard label="Gelmeyen" value={String(summary.todayNoShowCount)} icon={CalendarX2} />
        <StatCard label="Günlük Ciro" value={formatCurrency(summary.todayRevenue)} icon={Wallet} accent />
        <StatCard label="Haftalık Ciro" value={formatCurrency(summary.weekRevenue)} icon={TrendingUp} />
        <StatCard
          label="Yeni Müşteri (Bu Hafta)"
          value={String(summary.newCustomersThisWeek)}
          icon={UserPlus}
        />
      </div>

      <Link
        href="/appointments?new=1"
        className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-ink)] px-4 py-3.5 text-center text-sm font-medium text-[var(--color-accent-soft)] shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
      >
        <PlusCircle size={17} />
        Yeni Randevu
      </Link>
    </div>
  );
}
