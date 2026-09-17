import { requireTenant } from "@/lib/session";
import { listEmployees } from "@/server/services/employee.service";
import { listServices } from "@/server/services/catalog.service";
import { EmployeesClient } from "./EmployeesClient";
import { PageHeader } from "@/components/ui/PageHeader";
import type { EmployeeDTO, ServiceDTO } from "@/types/dto";

export default async function EmployeesPage() {
  const tenant = await requireTenant();
  const [employees, services] = await Promise.all([
    listEmployees(tenant.businessId, true),
    listServices(tenant.businessId),
  ]);

  const employeeDto: EmployeeDTO[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    phone: e.phone,
    isActive: e.isActive,
    serviceIds: e.employeeServices.map((es) => es.serviceId),
    workSchedules: e.workSchedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isOff: s.isOff,
    })),
  }));

  const serviceDto: ServiceDTO[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price),
    durationMinutes: s.durationMinutes,
    isActive: s.isActive,
  }));

  return (
    <div className="space-y-4">
      <PageHeader title="Çalışanlar" subtitle="Ekip, çalışma saatleri ve yetkinlikler" />
      <EmployeesClient initialEmployees={employeeDto} services={serviceDto} />
    </div>
  );
}
