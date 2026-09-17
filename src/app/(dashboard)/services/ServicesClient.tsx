"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Clock, Plus } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Card, Badge } from "@/components/ui/Card";
import type { ServiceDTO } from "@/types/dto";

type FormState = { name: string; price: string; durationMinutes: string };
const EMPTY_FORM: FormState = { name: "", price: "", durationMinutes: "" };

export function ServicesClient({ initialServices }: { initialServices: ServiceDTO[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function startEdit(service: ServiceDTO) {
    setEditingId(service.id);
    setCreating(false);
    setForm({ name: service.name, price: String(service.price), durationMinutes: String(service.durationMinutes) });
    setError(null);
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function cancel() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  async function submit() {
    setPending(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      isActive: true,
    };
    try {
      if (editingId) {
        await api.patch(`/api/services/${editingId}`, payload);
      } else {
        await api.post("/api/services", payload);
      }
      cancel();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setPending(false);
    }
  }

  async function toggleActive(service: ServiceDTO) {
    setPending(true);
    try {
      if (service.isActive) {
        await api.delete(`/api/services/${service.id}`);
      } else {
        await api.patch(`/api/services/${service.id}`, { isActive: true });
      }
      router.refresh();
    } catch {
      // best-effort — row simply won't update; user can retry
    } finally {
      setPending(false);
    }
  }

  const showForm = creating || editingId !== null;

  return (
    <div className="space-y-3">
      {!showForm && (
        <Button variant="secondary" className="w-full" onClick={startCreate}>
          <Plus size={16} /> Yeni Hizmet
        </Button>
      )}

      {showForm && (
        <Card className="space-y-3 p-4">
          <Field label="Hizmet Adı">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Saç Kesimi" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fiyat (TL)">
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Süre (dk)">
              <Input
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              />
            </Field>
          </div>
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submit} disabled={pending || !form.name || !form.price || !form.durationMinutes}>
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button variant="secondary" onClick={cancel} disabled={pending}>
              Vazgeç
            </Button>
          </div>
        </Card>
      )}

      <ul className="space-y-2">
        {initialServices.map((service) => (
          <Card
            as="li"
            key={service.id}
            className={`flex items-center gap-3 p-3.5 ${service.isActive ? "" : "opacity-50"}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]">
              <Scissors size={17} />
            </span>
            <button type="button" onClick={() => startEdit(service)} className="min-w-0 flex-1 text-left">
              <p className="truncate font-medium text-[var(--color-ink)]">{service.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
                <Clock size={12} /> {service.durationMinutes} dk
              </p>
            </button>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Badge tone="accent">{formatCurrency(service.price)}</Badge>
              <button
                type="button"
                onClick={() => toggleActive(service)}
                disabled={pending}
                className="text-[11px] font-medium text-[var(--color-ink-faint)] underline underline-offset-2 hover:text-[var(--color-ink-muted)]"
              >
                {service.isActive ? "Pasif yap" : "Aktif yap"}
              </button>
            </div>
          </Card>
        ))}
        {initialServices.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--color-ink-faint)]">Henüz hizmet eklenmedi.</p>
        )}
      </ul>
    </div>
  );
}
