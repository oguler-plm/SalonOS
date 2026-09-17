import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireTenant } from "@/lib/session";
import { findOrNull } from "@/server/services/customer.service";
import { formatCurrency, formatDateLong, formatTime } from "@/lib/format";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { Card, Badge } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await requireTenant();
  const customer = await findOrNull(tenant.businessId, id);
  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-[var(--color-ink-muted)]">
        <ArrowLeft size={14} /> Müşteriler
      </Link>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Avatar name={`${customer.firstName} ${customer.lastName}`} size={48} />
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg text-[var(--color-ink)]">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-sm text-[var(--color-ink-muted)]">{customer.phone}</p>
          </div>
        </div>
        {customer.notes && (
          <p className="mt-3 rounded-lg bg-[var(--color-surface-alt)] px-3 py-2 text-sm text-[var(--color-ink-muted)]">
            {customer.notes}
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-4 text-center">
          <div>
            <p className="font-display text-xl text-[var(--color-ink)]">{customer.totalVisits}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Ziyaret</p>
          </div>
          <div>
            <p className="font-display text-xl text-[var(--color-ink)]">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Toplam Harcama</p>
          </div>
          <div>
            <p className="font-display text-xl text-[var(--color-ink)]">
              {customer.lastVisitAt ? formatDateLong(customer.lastVisitAt) : "—"}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">Son Ziyaret</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-ink-muted)]">Randevu Geçmişi</h2>
        <ul className="space-y-2">
          {customer.appointments.map((a) => (
            <Card key={a.id} as="li" className="flex items-center justify-between p-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-ink)]">{a.service.name}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {formatDateLong(a.startTime)} · {formatTime(a.startTime)} · {a.employee.name}
                </p>
              </div>
              <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>{STATUS_LABEL[a.status] ?? a.status}</Badge>
            </Card>
          ))}
          {customer.appointments.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--color-ink-faint)]">Henüz randevu geçmişi yok.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
