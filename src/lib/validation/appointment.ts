import { z } from "zod";

export const createAppointmentSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçin"),
  employeeId: z.string().min(1, "Çalışan seçin"),
  serviceId: z.string().min(1, "Hizmet seçin"),
  startTime: z.iso.datetime({ offset: true }),
  source: z.enum(["MANUAL", "WHATSAPP", "AI_AGENT"]).default("MANUAL"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const rescheduleAppointmentSchema = z.object({
  startTime: z.iso.datetime({ offset: true }),
  employeeId: z.string().optional(),
});

export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

export const availableSlotsQuerySchema = z.object({
  date: z.iso.date(),
  serviceId: z.string().min(1),
  employeeId: z.string().optional(),
});

export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;
