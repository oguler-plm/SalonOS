"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

export function SettingsClient({
  canEdit,
  initialName,
  initialPhone,
  initialWhatsappNumber,
}: {
  canEdit: boolean;
  initialName: string;
  initialPhone: string;
  initialWhatsappNumber: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsappNumber);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch("/api/business/settings", { name, phone, whatsappNumber });
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <p className="text-[13px] font-medium text-[var(--color-ink-muted)]">İşletme Bilgileri</p>
        <Field label="İşletme Adı">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
        </Field>
        <Field label="Telefon">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!canEdit} />
        </Field>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-muted)]">
          <MessageCircle size={14} /> WhatsApp Entegrasyonu
        </p>
        <Field label="WhatsApp İşletme Numarası">
          <Input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            disabled={!canEdit}
            placeholder="+90 5xx xxx xx xx"
          />
        </Field>
        <p className="rounded-lg bg-[var(--color-accent-soft)] px-3 py-2 text-xs text-[var(--color-accent-ink)]">
          WhatsApp entegrasyonu ileriki bir sürümde aktifleşecek — bu numara şimdiden hazırlık amaçlı kaydedilir.
        </p>
      </Card>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      {success && <p className="text-sm text-[var(--color-success)]">Kaydedildi.</p>}

      {canEdit && (
        <Button onClick={submit} disabled={pending} className="w-full">
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      )}
    </div>
  );
}
