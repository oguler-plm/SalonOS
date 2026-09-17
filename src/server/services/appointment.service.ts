import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import * as apptRepo from "@/server/repositories/appointment.repository";
import * as employeeRepo from "@/server/repositories/employee.repository";
import * as serviceRepo from "@/server/repositories/service.repository";
import * as customerRepo from "@/server/repositories/customer.repository";
import type { AppointmentStatus, Employee, EmployeeService, TimeOff, WorkSchedule } from "@prisma/client";
import type {
  CreateAppointmentInput,
  RescheduleAppointmentInput,
} from "@/lib/validation/appointment";

const SLOT_STEP_MINUTES = 15;

type EmployeeWithSchedule = Employee & {
  workSchedules: WorkSchedule[];
  timeOffs: TimeOff[];
  employeeServices: EmployeeService[];
};

function atTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWithinTimeOff(timeOffs: TimeOff[], date: Date): boolean {
  return timeOffs.some((t) => date >= t.startDate && date <= t.endDate);
}

async function getServiceOrThrow(businessId: string, serviceId: string) {
  const service = await serviceRepo.findServiceById(businessId, serviceId);
  if (!service) throw new NotFoundError("Hizmet bulunamadı");
  if (!service.isActive) throw new ValidationError("Bu hizmet artık aktif değil");
  return service;
}

async function getEmployeeOrThrow(businessId: string, employeeId: string) {
  const employee = await employeeRepo.findEmployeeById(businessId, employeeId);
  if (!employee) throw new NotFoundError("Çalışan bulunamadı");
  if (!employee.isActive) throw new ValidationError("Bu çalışan artık aktif değil");
  return employee;
}

function assertCanPerform(employee: { employeeServices: { serviceId: string }[] }, serviceId: string) {
  const canPerform = employee.employeeServices.some((es) => es.serviceId === serviceId);
  if (!canPerform) {
    throw new ValidationError("Seçilen çalışan bu hizmeti veremiyor");
  }
}

export function listAppointments(
  businessId: string,
  filters: { from: Date; to: Date; employeeId?: string; status?: AppointmentStatus },
) {
  return apptRepo.listAppointments(businessId, filters);
}

export async function getAppointment(businessId: string, appointmentId: string) {
  const appt = await apptRepo.findAppointmentById(businessId, appointmentId);
  if (!appt) throw new NotFoundError("Randevu bulunamadı");
  return appt;
}

export async function createAppointment(businessId: string, input: CreateAppointmentInput) {
  const service = await getServiceOrThrow(businessId, input.serviceId);
  const employee = await getEmployeeOrThrow(businessId, input.employeeId);
  assertCanPerform(employee, input.serviceId);

  const customer = await customerRepo.findCustomerRaw(businessId, input.customerId);
  if (!customer) throw new NotFoundError("Müşteri bulunamadı");

  const startTime = new Date(input.startTime);
  if (Number.isNaN(startTime.getTime())) throw new ValidationError("Geçersiz tarih/saat");
  if (startTime.getTime() < Date.now()) throw new ValidationError("Geçmiş bir saate randevu oluşturulamaz");

  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60_000);

  return apptRepo.runInTransaction(async (tx) => {
    const conflict = await apptRepo.hasConflict(businessId, input.employeeId, startTime, endTime, undefined, tx);
    if (conflict) throw new ConflictError("Bu çalışan için seçilen saatte çakışan bir randevu var");

    return apptRepo.createAppointmentRecord(tx, businessId, {
      customerId: input.customerId,
      employeeId: input.employeeId,
      serviceId: input.serviceId,
      startTime,
      endTime,
      price: service.price,
      source: input.source,
    });
  });
}

export async function rescheduleAppointment(
  businessId: string,
  appointmentId: string,
  input: RescheduleAppointmentInput,
) {
  const existing = await apptRepo.findAppointmentById(businessId, appointmentId);
  if (!existing) throw new NotFoundError("Randevu bulunamadı");
  if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
    throw new ValidationError("Tamamlanmış veya iptal edilmiş randevu değiştirilemez");
  }

  const employeeId = input.employeeId ?? existing.employeeId;
  const employee = await getEmployeeOrThrow(businessId, employeeId);
  assertCanPerform(employee, existing.serviceId);

  const startTime = new Date(input.startTime);
  if (Number.isNaN(startTime.getTime())) throw new ValidationError("Geçersiz tarih/saat");
  if (startTime.getTime() < Date.now()) throw new ValidationError("Geçmiş bir saate randevu taşınamaz");

  const durationMs = existing.endTime.getTime() - existing.startTime.getTime();
  const endTime = new Date(startTime.getTime() + durationMs);

  return apptRepo.runInTransaction(async (tx) => {
    const conflict = await apptRepo.hasConflict(businessId, employeeId, startTime, endTime, appointmentId, tx);
    if (conflict) throw new ConflictError("Bu çalışan için seçilen saatte çakışan bir randevu var");

    return apptRepo.rescheduleAppointmentRecord(tx, businessId, appointmentId, { employeeId, startTime, endTime });
  });
}

export async function updateAppointmentStatus(businessId: string, appointmentId: string, status: AppointmentStatus) {
  const updated = await apptRepo.updateAppointmentStatus(businessId, appointmentId, status);
  if (!updated) throw new NotFoundError("Randevu bulunamadı");
  return updated;
}

export function cancelAppointment(businessId: string, appointmentId: string) {
  return updateAppointmentStatus(businessId, appointmentId, "CANCELLED");
}

export type AvailableSlot = {
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
};

/** Powers both the "Yeni Randevu" UI and the AI agent's get_available_slots tool. */
export async function getAvailableSlots(
  businessId: string,
  params: { date: string; serviceId: string; employeeId?: string },
): Promise<AvailableSlot[]> {
  const service = await getServiceOrThrow(businessId, params.serviceId);

  const day = startOfDay(new Date(params.date));
  if (Number.isNaN(day.getTime())) throw new ValidationError("Geçersiz tarih");
  const nextDay = new Date(day.getTime() + 24 * 60 * 60_000);

  let candidates: EmployeeWithSchedule[];
  if (params.employeeId) {
    const employee = await getEmployeeOrThrow(businessId, params.employeeId);
    assertCanPerform(employee, params.serviceId);
    candidates = [employee];
  } else {
    candidates = await employeeRepo.listEmployeesCapableOf(businessId, params.serviceId);
  }

  const now = new Date();
  const dayOfWeek = day.getDay();
  const slots: AvailableSlot[] = [];

  for (const employee of candidates) {
    const schedule = employee.workSchedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!schedule || schedule.isOff) continue;
    if (isWithinTimeOff(employee.timeOffs, day)) continue;

    const workStart = atTime(day, schedule.startTime);
    const workEnd = atTime(day, schedule.endTime);
    const lastPossibleStart = new Date(workEnd.getTime() - service.durationMinutes * 60_000);
    if (lastPossibleStart < workStart) continue;

    const busy = await apptRepo.listBusyAppointments(businessId, employee.id, day, nextDay);

    for (
      let slotStart = new Date(workStart);
      slotStart <= lastPossibleStart;
      slotStart = new Date(slotStart.getTime() + SLOT_STEP_MINUTES * 60_000)
    ) {
      if (slotStart < now) continue;
      const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60_000);

      const overlaps = busy.some((b) => slotStart < b.endTime && slotEnd > b.startTime);
      if (overlaps) continue;

      slots.push({
        employeeId: employee.id,
        employeeName: employee.name,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
      });
    }
  }

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.employeeName.localeCompare(b.employeeName));
}
