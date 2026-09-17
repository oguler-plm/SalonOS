import { z } from "zod";

const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saat HH:MM formatında olmalı");

export const workScheduleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: timeString,
    endTime: timeString,
    isOff: z.boolean().default(false),
  })
  .refine((s) => s.isOff || s.startTime < s.endTime, {
    message: "Bitiş saati başlangıç saatinden sonra olmalı",
    path: ["endTime"],
  });

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter olmalı"),
  phone: z.string().trim().min(6).optional().or(z.literal("")),
  serviceIds: z.array(z.string()).default([]),
  workSchedules: z.array(workScheduleSchema).default([]),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const timeOffSchema = z.object({
  startDate: z.iso.datetime({ offset: true }).or(z.iso.date()),
  endDate: z.iso.datetime({ offset: true }).or(z.iso.date()),
  reason: z.string().trim().optional().or(z.literal("")),
});

export type TimeOffInput = z.infer<typeof timeOffSchema>;
