import { prisma } from "@/lib/prisma";

/**
 * Appointments starting inside [windowStart, windowEnd) that don't already
 * have a WhatsApp reminder logged — the job's dedupe check. Cross-tenant by
 * design: this runs as a system job, not on behalf of any one signed-in user.
 */
export function findAppointmentsNeedingReminder(windowStart: Date, windowEnd: Date) {
  return prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startTime: { gte: windowStart, lt: windowEnd },
      reminderLogs: { none: { channel: "WHATSAPP" } },
    },
    include: { customer: true, service: true, business: true },
  });
}

export function createReminderLog(appointmentId: string, scheduledAt: Date) {
  return prisma.reminderLog.create({
    data: { appointmentId, channel: "WHATSAPP", scheduledAt, status: "PENDING" },
  });
}

export function markReminderSent(reminderLogId: string) {
  return prisma.reminderLog.update({
    where: { id: reminderLogId },
    data: { status: "SENT", sentAt: new Date() },
  });
}

export function markReminderFailed(reminderLogId: string, error: string) {
  return prisma.reminderLog.update({
    where: { id: reminderLogId },
    data: { status: "FAILED", error },
  });
}
