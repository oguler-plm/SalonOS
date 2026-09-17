"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronRight } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import type { CustomerDTO, EmployeeDTO, ServiceDTO } from "@/types/dto";

const EMPTY_FORM = { firstName: "", lastName: "", phone: "", notes: "", preferredEmployeeId: "", preferredServiceId: "" };

export function CustomersClient({
  initialCustomers,
  employees,
  services,
}: {
  initialCustomers: CustomerDTO[];
  employees: EmployeeDTO[];
  services: ServiceDTO[];
}) {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<CustomerDTO[] | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const customers = searchResults ?? initialCustomers;

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!search) {
        setSearchResults(null);
        return;
      }
      try {
        const result = await api.get<{ customers: CustomerDTO[] }>(`/api/customers?search=${encodeURIComponent(search)}`);
        setSearchResults(result.customers);
      } catch {
        // keep last known results on transient failure
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await api.post("/api/customers", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
        preferredEmployeeId: form.preferredEmployeeId,
        preferredServiceId: form.preferredServiceId,
      });
      setCreating(false);
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
        <Input
          placeholder="Ad, soyad veya telefon ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {!creating && (
        <Button variant="secondary" className="w-full" onClick={() => setCreating(true)}>
          <Plus size={16} /> Yeni Müşteri
        </Button>
      )}

      {creating && (
        <Card className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ad">
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </Field>
            <Field label="Soyad">
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </Field>
          </div>
          <Field label="Telefon">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tercih Ettiği Çalışan">
              <Select
                value={form.preferredEmployeeId}
                onChange={(e) => setForm({ ...form, preferredEmployeeId: e.target.value })}
              >
                <option value="">Fark etmez</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tercih Ettiği Hizmet">
              <Select
                value={form.preferredServiceId}
                onChange={(e) => setForm({ ...form, preferredServiceId: e.target.value })}
              >
                <option value="">Fark etmez</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Notlar">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submit} disabled={pending || !form.firstName || !form.lastName || !form.phone}>
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button variant="secondary" onClick={() => setCreating(false)} disabled={pending}>
              Vazgeç
            </Button>
          </div>
        </Card>
      )}

      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id}>
            <Card as={Link} href={`/customers/${c.id}`} className="flex items-center gap-3 p-3.5">
              <Avatar name={`${c.firstName} ${c.lastName}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[var(--color-ink)]">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-sm text-[var(--color-ink-muted)]">{c.phone}</p>
              </div>
              <div className="shrink-0 text-right text-sm text-[var(--color-ink-muted)]">
                <p className="font-medium text-[var(--color-ink)]">{formatCurrency(c.totalSpent)}</p>
                <p className="text-xs">{c.totalVisits} ziyaret</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-[var(--color-ink-faint)]" />
            </Card>
          </li>
        ))}
        {customers.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--color-ink-faint)]">Müşteri bulunamadı.</p>
        )}
      </ul>
    </div>
  );
}
