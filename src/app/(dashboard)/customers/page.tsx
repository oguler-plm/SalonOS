import { requireTenant } from "@/lib/session";
import { listCustomers } from "@/server/services/customer.service";
import { listEmployees } from "@/server/services/employee.service";
import { listServices } from "@/server/services/catalog.service";
import { CustomersClient } from "./CustomersClient";
import { PageHeader } from "@/components/ui/PageHeader";
import type { CustomerDTO, EmployeeDTO, ServiceDTO } from "@/types/dto";

export default async function CustomersPage() {
  const tenant = await requireTenant();
  const [customers, employees, services] = await Promise.all([
    listCustomers(tenant.businessId),
    listEmployees(tenant.businessId),
    listServices(tenant.businessId),
  ]);

  const customerDto: CustomerDTO[] = customers.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    notes: c.notes,
    totalVisits: c.totalVisits,
    totalSpent: c.totalSpent,
    lastVisitAt: c.lastVisitAt ? c.lastVisitAt.toISOString() : null,
    preferredEmployeeId: c.preferredEmployeeId,
    preferredServiceId: c.preferredServiceId,
  }));

  const employeeDto: EmployeeDTO[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    phone: e.phone,
    isActive: e.isActive,
    serviceIds: e.employeeServices.map((es) => es.serviceId),
    workSchedules: [],
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
      <PageHeader title="Müşteriler" subtitle="Müşteri geçmişi, ziyaret ve harcama özetleri" />
      <CustomersClient initialCustomers={customerDto} employees={employeeDto} services={serviceDto} />
    </div>
  );
}
