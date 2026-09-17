"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Phone } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import type { EmployeeDTO, ServiceDTO } from "@/types/dto";

const DAYS = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 0, label: "Pazar" },
] as const;

type DaySchedule = { isOff: boolean; startTime: string; endTime: string };
type FormState = {
  name: string;
  phone: string;
  serviceIds: string[];
  schedules: Record<number, DaySchedule>;
};

function defaultSchedules(): Record<number, DaySchedule> {
  const schedules: Record<number, DaySchedule> = {};
  for (const day of DAYS) {
    schedules[day.value] = { isOff: day.value === 0, startTime: "09:00", endTime: "19:00" };
  }
  return schedules;
}

function emptyForm(): FormState {
  return { name: "", phone: "", serviceIds: [], schedules: defaultSchedules() };
}

function toFormState(employee: EmployeeDTO): FormState {
  const schedules = defaultSchedules();
  for (const s of employee.workSchedules) {
    schedules[s.dayOfWeek] = { isOff: s.isOff, startTime: s.startTime, endTime: s.endTime };
  }
  return { name: employee.name, phone: employee.phone ?? "", serviceIds: employee.serviceIds, schedules };
}

export function EmployeesClient({
  initialEmployees,
  services,
}: {
  initialEmployees: EmployeeDTO[];
  services: ServiceDTO[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  }

  function startEdit(employee: EmployeeDTO) {
    setEditingId(employee.id);
    setCreating(false);
    setForm(toFormState(employee));
    setError(null);
  }

  function cancel() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  function toggleService(serviceId: string) {
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(serviceId)
        ? f.serviceIds.filter((id) => id !== serviceId)
        : [...f.serviceIds, serviceId],
    }));
  }

  function updateDay(day: number, patch: Partial<DaySchedule>) {
    setForm((f) => ({ ...f, schedules: { ...f.schedules, [day]: { ...f.schedules[day], ...patch } } }));
  }

  async function submit() {
    setPending(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      serviceIds: form.serviceIds,
      workSchedules: DAYS.map((d) => ({
        dayOfWeek: d.value,
        startTime: form.schedules[d.value].startTime,
        endTime: form.schedules[d.value].endTime,
        isOff: form.schedules[d.value].isOff,
      })),
    };
    try {
      if (editingId) {
        await api.patch(`/api/employees/${editingId}`, payload);
      } else {
        await api.post("/api/employees", payload);
      }
      cancel();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setPending(false);
    }
  }

  async function toggleActive(employee: EmployeeDTO) {
    setPending(true);
    try {
      await api.patch(`/api/employees/${employee.id}`, { isActive: !employee.isActive });
      router.refresh();
    } catch {
      // best-effort
    } finally {
      setPending(false);
    }
  }

  const showForm = creating || editingId !== null;

  return (
    <div className="space-y-3">
      {!showForm && (
        <Button variant="secondary" className="w-full" onClick={startCreate}>
          <Plus size={16} /> Yeni Çalışan
        </Button>
      )}

      {showForm && (
        <Card className="space-y-4 p-4">
          <Field label="İsim">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ahmet" />
          </Field>
          <Field label="Telefon (opsiyonel)">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>

          <div>
            <p className="mb-2 text-[13px] font-medium text-[var(--color-ink-muted)]">Verebildiği Hizmetler</p>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.serviceIds.includes(s.id)
                      ? "bg-[var(--color-ink)] text-[var(--color-accent-soft)]"
                      : "bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)] ring-1 ring-inset ring-[var(--color-border-strong)]"
                  }`}
                >
                  {s.name}
                </button>
              ))}
              {services.length === 0 && (
                <p className="text-xs text-[var(--color-ink-faint)]">Önce Hizmetler sayfasından hizmet ekleyin.</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-[var(--color-ink-muted)]">Çalışma Saatleri</p>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const s = form.schedules[day.value];
                return (
                  <div key={day.value} className="flex items-center gap-2">
                    <label className="flex w-24 flex-shrink-0 items-center gap-1.5 text-sm text-[var(--color-ink)]">
                      <input
                        type="checkbox"
                        checked={!s.isOff}
                        onChange={(e) => updateDay(day.value, { isOff: !e.target.checked })}
                        className="accent-[var(--color-accent)]"
                      />
                      {day.label}
                    </label>
                    {!s.isOff && (
                      <>
                        <Input
                          type="time"
                          value={s.startTime}
                          onChange={(e) => updateDay(day.value, { startTime: e.target.value })}
                          className="w-28"
                        />
                        <span className="text-[var(--color-ink-faint)]">–</span>
                        <Input
                          type="time"
                          value={s.endTime}
                          onChange={(e) => updateDay(day.value, { endTime: e.target.value })}
                          className="w-28"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submit} disabled={pending || !form.name}>
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button variant="secondary" onClick={cancel} disabled={pending}>
              Vazgeç
            </Button>
          </div>
        </Card>
      )}

      <ul className="space-y-2">
        {initialEmployees.map((employee) => (
          <Card
            as="li"
            key={employee.id}
            className={`flex items-center gap-3 p-3.5 ${employee.isActive ? "" : "opacity-50"}`}
          >
            <Avatar name={employee.name} />
            <button type="button" onClick={() => startEdit(employee)} className="min-w-0 flex-1 text-left">
              <p className="truncate font-medium text-[var(--color-ink)]">{employee.name}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                <span>{employee.serviceIds.length} hizmet</span>
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={11} /> {employee.phone}
                  </span>
                )}
              </p>
            </button>
            <button
              type="button"
              onClick={() => toggleActive(employee)}
              disabled={pending}
              className="shrink-0 text-[11px] font-medium text-[var(--color-ink-faint)] underline underline-offset-2 hover:text-[var(--color-ink-muted)]"
            >
              {employee.isActive ? "Pasif yap" : "Aktif yap"}
            </button>
          </Card>
        ))}
        {initialEmployees.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--color-ink-faint)]">Henüz çalışan eklenmedi.</p>
        )}
      </ul>
    </div>
  );
}
