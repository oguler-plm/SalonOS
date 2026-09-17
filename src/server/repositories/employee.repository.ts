import { prisma } from "@/lib/prisma";
import type { CreateEmployeeInput, UpdateEmployeeInput, TimeOffInput } from "@/lib/validation/employee";

export function listEmployees(businessId: string, opts?: { includeInactive?: boolean }) {
  return prisma.employee.findMany({
    where: {
      businessId,
      ...(opts?.includeInactive ? {} : { isActive: true }),
    },
    include: {
      workSchedules: true,
      employeeServices: { include: { service: true } },
    },
    orderBy: { name: "asc" },
  });
}

export function listEmployeesCapableOf(businessId: string, serviceId: string) {
  return prisma.employee.findMany({
    where: { businessId, isActive: true, employeeServices: { some: { serviceId } } },
    include: { workSchedules: true, timeOffs: true, employeeServices: true },
  });
}

export function findEmployeeById(businessId: string, employeeId: string) {
  return prisma.employee.findFirst({
    where: { id: employeeId, businessId },
    include: {
      workSchedules: true,
      timeOffs: true,
      employeeServices: { include: { service: true } },
    },
  });
}

export async function createEmployee(businessId: string, input: CreateEmployeeInput) {
  return prisma.employee.create({
    data: {
      businessId,
      name: input.name,
      phone: input.phone || null,
      workSchedules: {
        create: input.workSchedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isOff: s.isOff,
        })),
      },
      employeeServices: {
        create: input.serviceIds.map((serviceId) => ({ serviceId })),
      },
    },
    include: { workSchedules: true, employeeServices: { include: { service: true } } },
  });
}

export async function updateEmployee(businessId: string, employeeId: string, input: UpdateEmployeeInput) {
  // Ownership check first — a stray update-by-id without this could leak across tenants.
  const existing = await prisma.employee.findFirst({ where: { id: employeeId, businessId } });
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    if (input.workSchedules) {
      await tx.workSchedule.deleteMany({ where: { employeeId } });
      await tx.workSchedule.createMany({
        data: input.workSchedules.map((s) => ({
          employeeId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isOff: s.isOff,
        })),
      });
    }

    if (input.serviceIds) {
      await tx.employeeService.deleteMany({ where: { employeeId } });
      await tx.employeeService.createMany({
        data: input.serviceIds.map((serviceId) => ({ employeeId, serviceId })),
      });
    }

    return tx.employee.update({
      where: { id: employeeId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: { workSchedules: true, employeeServices: { include: { service: true } } },
    });
  });
}

export async function addTimeOff(businessId: string, employeeId: string, input: TimeOffInput) {
  const existing = await prisma.employee.findFirst({ where: { id: employeeId, businessId } });
  if (!existing) return null;

  return prisma.timeOff.create({
    data: {
      employeeId,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      reason: input.reason || null,
    },
  });
}
