"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDateLong, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, Badge } from "@/components/ui/Card";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { NewAppointmentForm } from "./NewAppointmentForm";
import type { AppointmentDTO, EmployeeDTO, ServiceDTO } from "@/types/dto";

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function StatusActions({ appointment, onChanged }: { appointment: AppointmentDTO; onChanged: () => void }) {
  const [pending, setPending] = useState(false);

  async function setStatus(status: AppointmentDTO["status"]) {
    setPending(true);
    try {
      await api.patch(`/api/appointments/${appointment.id}/status`, { status });
      onChanged();
    } catch {
      // best-effort — user can retry from the row
    } finally {
      setPending(false);
    }
  }

  if (appointment.status === "PENDING") {
    return (
      <div className="flex gap-3">
        <button
          disabled={pending}
          onClick={() => setStatus("CONFIRMED")}
          className="text-xs font-medium text-[var(--color-info)] underline underline-offset-2"
        >
          Onayla
        </button>
        <button
          disabled={pending}
          onClick={() => setStatus("CANCELLED")}
          className="text-xs font-medium text-[var(--color-ink-faint)] underline underline-offset-2"
        >
          İptal
        </button>
      </div>
    );
  }

  if (appointment.status === "CONFIRMED") {
    return (
      <div className="flex gap-3">
        <button
          disabled={pending}
          onClick={() => setStatus("COMPLETED")}
          className="text-xs font-medium text-[var(--color-success)] underline underline-offset-2"
        >
          Tamamlandı
        </button>
        <button
          disabled={pending}
          onClick={() => setStatus("NO_SHOW")}
          className="text-xs font-medium text-[var(--color-danger)] underline underline-offset-2"
        >
          Gelmedi
        </button>
        <button
          disabled={pending}
          onClick={() => setStatus("CANCELLED")}
          className="text-xs font-medium text-[var(--color-ink-faint)] underline underline-offset-2"
        >
          İptal
        </button>
      </div>
    );
  }

  return null;
}

export function AppointmentsClient({
  date,
  initialAppointments,
  employees,
  services,
  openNewOnLoad,
}: {
  date: string;
  initialAppointments: AppointmentDTO[];
  employees: EmployeeDTO[];
  services: ServiceDTO[];
  openNewOnLoad: boolean;
}) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(openNewOnLoad);

  const isToday = date === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent-dark)]">Takvim</p>
          <h1 className="font-display text-2xl text-[var(--color-ink)]">
            {isToday ? "Bugün" : formatDateLong(new Date(`${date}T00:00:00`))}
          </h1>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-1">
          <button
            onClick={() => router.push(`/appointments?date=${addDays(date, -1)}`)}
            className="rounded-lg p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-alt)]"
            aria-label="Önceki gün"
          >
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => router.push(`/appointments?date=${e.target.value}`)}
            className="rounded-lg bg-transparent px-1 py-1 text-sm text-[var(--color-ink)] focus:outline-none"
          />
          <button
            onClick={() => router.push(`/appointments?date=${addDays(date, 1)}`)}
            className="rounded-lg p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-alt)]"
            aria-label="Sonraki gün"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {!showNewForm && (
        <Button variant="secondary" className="w-full" onClick={() => setShowNewForm(true)}>
          <Plus size={16} /> Yeni Randevu
        </Button>
      )}

      {showNewForm && (
        <NewAppointmentForm date={date} employees={employees} services={services} onClose={() => setShowNewForm(false)} />
      )}

      <ul className="space-y-2.5">
        {initialAppointments.map((a) => (
          <Card key={a.id} as="li" className="flex gap-3 p-3.5">
            <div className="flex w-14 shrink-0 flex-col items-center border-r border-[var(--color-border)] pr-3 text-center">
              <span className="font-display text-base leading-none text-[var(--color-ink)]">
                {formatTime(new Date(a.startTime))}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-medium text-[var(--color-ink)]">{a.customerName}</p>
                <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>{STATUS_LABEL[a.status]}</Badge>
              </div>
              <p className="mt-0.5 truncate text-sm text-[var(--color-ink-muted)]">
                {a.serviceName} · {a.employeeName} · {formatCurrency(a.price)}
              </p>
              <div className="mt-2">
                <StatusActions appointment={a} onChanged={() => router.refresh()} />
              </div>
            </div>
          </Card>
        ))}
        {initialAppointments.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--color-ink-faint)]">Bu tarihte randevu yok.</p>
        )}
      </ul>
    </div>
  );
}
