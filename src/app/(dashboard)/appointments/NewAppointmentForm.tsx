"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiClientError } from "@/lib/api-client";
import { formatTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import type { EmployeeDTO, ServiceDTO, CustomerDTO } from "@/types/dto";

type Slot = { employeeId: string; employeeName: string; startTime: string; endTime: string };

export function NewAppointmentForm({
  date,
  employees,
  services,
  onClose,
}: {
  date: string;
  employees: EmployeeDTO[];
  services: ServiceDTO[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState("");
  const [pickedDate, setPickedDate] = useState(date);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerDTO[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
  const [newCustomer, setNewCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ firstName: "", lastName: "", phone: "" });

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!serviceId || !pickedDate) return;
    // Kicking off a fetch in response to a user selection (not mirroring a
    // prop into state), so the loading/selection reset here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true);
    setSelectedSlot(null);
    api
      .get<{ slots: Slot[] }>(`/api/appointments/available-slots?date=${pickedDate}&serviceId=${serviceId}`)
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, pickedDate]);

  const visibleSlots = serviceId && pickedDate ? slots : [];

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!customerSearch || selectedCustomer) {
        setCustomerResults([]);
        return;
      }
      api
        .get<{ customers: CustomerDTO[] }>(`/api/customers?search=${encodeURIComponent(customerSearch)}`)
        .then((res) => setCustomerResults(res.customers))
        .catch(() => setCustomerResults([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [customerSearch, selectedCustomer]);

  async function submit() {
    setError(null);
    if (!selectedSlot) return setError("Bir saat seçin");

    setPending(true);
    try {
      let customerId = selectedCustomer?.id;
      if (!customerId && newCustomer) {
        const created = await api.post<{ customer: { id: string } }>("/api/customers", {
          firstName: newCustomerForm.firstName.trim(),
          lastName: newCustomerForm.lastName.trim(),
          phone: newCustomerForm.phone.trim(),
        });
        customerId = created.customer.id;
      }
      if (!customerId) {
        setError("Bir müşteri seçin veya yeni müşteri bilgilerini girin");
        setPending(false);
        return;
      }

      await api.post("/api/appointments", {
        customerId,
        employeeId: selectedSlot.employeeId,
        serviceId,
        startTime: selectedSlot.startTime,
        source: "MANUAL",
      });

      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setPending(false);
    }
  }

  const groupedSlots = new Map<string, Slot[]>();
  for (const slot of visibleSlots) {
    const list = groupedSlots.get(slot.startTime) ?? [];
    list.push(slot);
    groupedSlots.set(slot.startTime, list);
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hizmet">
          <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Seçin</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tarih">
          <Input type="date" value={pickedDate} onChange={(e) => setPickedDate(e.target.value)} />
        </Field>
      </div>

      {serviceId && pickedDate && (
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-[var(--color-ink-muted)]">Müsait Saatler</p>
          {loadingSlots && <p className="text-sm text-[var(--color-ink-faint)]">Yükleniyor...</p>}
          {!loadingSlots && visibleSlots.length === 0 && (
            <p className="text-sm text-[var(--color-ink-faint)]">Bu tarihte müsait saat bulunamadı.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {Array.from(groupedSlots.entries()).map(([time, options]) =>
              options.map((slot) => (
                <button
                  key={`${slot.employeeId}-${time}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    selectedSlot === slot
                      ? "bg-[var(--color-ink)] text-[var(--color-accent-soft)]"
                      : "bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)] ring-1 ring-inset ring-[var(--color-border-strong)]"
                  }`}
                >
                  {formatTime(new Date(slot.startTime))} · {slot.employeeName}
                </button>
              )),
            )}
          </div>
        </div>
      )}

      {employees.length === 0 && (
        <p className="text-sm text-[var(--color-warning)]">Önce Çalışanlar sayfasından çalışan ekleyin.</p>
      )}

      <div>
        <p className="mb-1.5 text-[13px] font-medium text-[var(--color-ink-muted)]">Müşteri</p>
        {!newCustomer && !selectedCustomer && (
          <>
            <Input
              placeholder="Ad, soyad veya telefon ile ara..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            {customerResults.length > 0 && (
              <ul className="mt-1 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
                {customerResults.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-alt)]"
                    >
                      {c.firstName} {c.lastName} · {c.phone}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setNewCustomer(true)}
              className="mt-1.5 text-xs text-[var(--color-accent-dark)] underline underline-offset-2"
            >
              Yeni müşteri ekle
            </button>
          </>
        )}

        {selectedCustomer && (
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-alt)] px-3 py-2 text-sm">
            <span>
              {selectedCustomer.firstName} {selectedCustomer.lastName} · {selectedCustomer.phone}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="text-xs text-[var(--color-ink-muted)] underline underline-offset-2"
            >
              Değiştir
            </button>
          </div>
        )}

        {newCustomer && (
          <div className="space-y-2 rounded-lg bg-[var(--color-surface-alt)] p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Ad"
                value={newCustomerForm.firstName}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, firstName: e.target.value })}
              />
              <Input
                placeholder="Soyad"
                value={newCustomerForm.lastName}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, lastName: e.target.value })}
              />
            </div>
            <Input
              placeholder="Telefon"
              value={newCustomerForm.phone}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setNewCustomer(false)}
              className="text-xs text-[var(--color-ink-muted)] underline underline-offset-2"
            >
              Vazgeç
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending || !selectedSlot}>
          {pending ? "Oluşturuluyor..." : "Randevu Oluştur"}
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Vazgeç
        </Button>
      </div>
    </Card>
  );
}
