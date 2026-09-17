import { requireTenant } from "@/lib/session";
import { getBusiness } from "@/server/services/business.service";
import { SettingsClient } from "./SettingsClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function SettingsPage() {
  const tenant = await requireTenant();
  const business = await getBusiness(tenant.businessId);
  const settings = (business?.settings as { whatsappNumber?: string } | null) ?? {};

  return (
    <div className="space-y-4">
      <PageHeader title="Ayarlar" subtitle="İşletme bilgileri ve entegrasyonlar" />
      <SettingsClient
        canEdit={tenant.role === "OWNER" || tenant.role === "MANAGER"}
        initialName={business?.name ?? ""}
        initialPhone={business?.phone ?? ""}
        initialWhatsappNumber={settings.whatsappNumber ?? ""}
      />
    </div>
  );
}
