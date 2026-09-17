import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient, AppointmentStatus } from "@prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

const ACTIVE_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED"];

export function listAppointments(
  businessId: string,
  filters: { from: Date; to: Date; employeeId?: string; status?: AppointmentStatus },
) {
  return prisma.appointment.findMany({
    where: {
      businessId,
      startTime: { gte: filters.from, lt: filters.to },
      ...(filters.employeeId && { employeeId: filters.employeeId }),
      ...(filters.status && { status: filters.status }),
    },
    include: { customer: true, employee: true, service: true },
    orderBy: { startTime: "asc" },
  });
}

export function findAppointmentById(businessId: string, appointmentId: string) {
  return prisma.appointment.findFirst({
    where: { id: appointmentId, businessId },
    include: { customer: true, employee: true, service: true },
  });
}

/** Busy (non-cancelled) appointments for one employee within a window — used for both conflict checks and slot computation. */
export function listBusyAppointments(
  businessId: string,
  employeeId: string,
  from: Date,
  to: Date,
  excludeAppointmentId?: string,
  tx: Tx = prisma,
) {
  return tx.appointment.findMany({
    where: {
      businessId,
      employeeId,
      status: { in: ACTIVE_STATUSES },
      startTime: { lt: to },
      endTime: { gt: from },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
    },
    orderBy: { startTime: "asc" },
  });
}

export async function hasConflict(
  businessId: string,
  employeeId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string,
  tx: Tx = prisma,
) {
  const conflicts = await listBusyAppointments(businessId, employeeId, startTime, endTime, excludeAppointmentId, tx);
  return conflicts.length > 0;
}

export function runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(fn);
}

export function createAppointmentRecord(
  tx: Tx,
  businessId: string,
  data: {
    customerId: string;
    employeeId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    price: Prisma.Decimal | number;
    source: "MANUAL" | "WHATSAPP" | "AI_AGENT";
  },
) {
  const date = new Date(data.startTime);
  date.setHours(0, 0, 0, 0);

  return tx.appointment.create({
    data: {
      businessId,
      customerId: data.customerId,
      employeeId: data.employeeId,
      serviceId: data.serviceId,
      date,
      startTime: data.startTime,
      endTime: data.endTime,
      price: data.price,
      source: data.source,
    },
    include: { customer: true, employee: true, service: true },
  });
}

export async function updateAppointmentStatus(businessId: string, appointmentId: string, status: AppointmentStatus) {
  const existing = await prisma.appointment.findFirst({ where: { id: appointmentId, businessId } });
  if (!existing) return null;

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: { customer: true, employee: true, service: true },
  });
}

export async function rescheduleAppointmentRecord(
  tx: Tx,
  businessId: string,
  appointmentId: string,
  data: { employeeId: string; startTime: Date; endTime: Date },
) {
  const date = new Date(data.startTime);
  date.setHours(0, 0, 0, 0);

  return tx.appointment.update({
    where: { id: appointmentId },
    data: {
      employeeId: data.employeeId,
      date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "PENDING",
    },
    include: { customer: true, employee: true, service: true },
  });
}

export function getDashboardCounts(businessId: string, dayStart: Date, dayEnd: Date, weekStart: Date, weekEnd: Date) {
  return Promise.all([
    prisma.appointment.count({ where: { businessId, startTime: { gte: dayStart, lt: dayEnd } } }),
    prisma.appointment.count({
      where: { businessId, startTime: { gte: dayStart, lt: dayEnd }, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: { businessId, startTime: { gte: dayStart, lt: dayEnd }, status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.appointment.aggregate({
      where: { businessId, startTime: { gte: dayStart, lt: dayEnd }, status: "COMPLETED" },
      _sum: { price: true },
    }),
    prisma.appointment.aggregate({
      where: { businessId, startTime: { gte: weekStart, lt: weekEnd }, status: "COMPLETED" },
      _sum: { price: true },
    }),
    prisma.customer.count({ where: { businessId, createdAt: { gte: weekStart, lt: weekEnd } } }),
    prisma.appointment.count({
      where: { businessId, startTime: { gte: dayStart, lt: dayEnd }, status: "NO_SHOW" },
    }),
  ]);
}
