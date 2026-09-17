import { requireTenant } from "@/lib/session";
import { listServices } from "@/server/services/catalog.service";
import { ServicesClient } from "./ServicesClient";
import { PageHeader } from "@/components/ui/PageHeader";
import type { ServiceDTO } from "@/types/dto";

export default async function ServicesPage() {
  const tenant = await requireTenant();
  const services = await listServices(tenant.businessId, true);

  const dto: ServiceDTO[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price),
    durationMinutes: s.durationMinutes,
    isActive: s.isActive,
  }));

  return (
    <div className="space-y-4">
      <PageHeader title="Hizmetler" subtitle="Sunduğunuz hizmetler, fiyatlar ve süreler" />
      <ServicesClient initialServices={dto} />
    </div>
  );
}
