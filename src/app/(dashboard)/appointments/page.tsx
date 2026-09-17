import { requireTenant } from "@/lib/session";
import { listAppointments } from "@/server/services/appointment.service";
import { listEmployees } from "@/server/services/employee.service";
import { listServices } from "@/server/services/catalog.service";
import { AppointmentsClient } from "./AppointmentsClient";
import type { AppointmentDTO, EmployeeDTO, ServiceDTO } from "@/types/dto";

function toDateOnly(value: string | undefined): Date {
  if (value) {
    const d = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; new?: string }>;
}) {
  const { date: dateParam, new: openNew } = await searchParams;
  const tenant = await requireTenant();

  const from = toDateOnly(dateParam);
  const to = new Date(from.getTime() + 24 * 60 * 60_000);

  const [appointments, employees, services] = await Promise.all([
    listAppointments(tenant.businessId, { from, to }),
    listEmployees(tenant.businessId),
    listServices(tenant.businessId),
  ]);

  const appointmentDto: AppointmentDTO[] = appointments.map((a) => ({
    id: a.id,
    customerId: a.customerId,
    customerName: `${a.customer.firstName} ${a.customer.lastName}`,
    employeeId: a.employeeId,
    employeeName: a.employee.name,
    serviceId: a.serviceId,
    serviceName: a.service.name,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    price: Number(a.price),
    status: a.status,
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
    <AppointmentsClient
      date={from.toISOString().slice(0, 10)}
      initialAppointments={appointmentDto}
      employees={employeeDto}
      services={serviceDto}
      openNewOnLoad={openNew === "1"}
    />
  );
}
