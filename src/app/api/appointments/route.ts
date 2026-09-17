import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { ValidationError } from "@/lib/errors";
import { createAppointmentSchema } from "@/lib/validation/appointment";
import * as appointmentService from "@/server/services/appointment.service";
import type { AppointmentStatus } from "@prisma/client";

const VALID_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export const GET = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const params = new URL(req.url).searchParams;

  const fromParam = params.get("from");
  const toParam = params.get("to");
  const employeeId = params.get("employeeId") ?? undefined;
  const statusParam = params.get("status");

  // Default window: today only — matches the "kim randevulu bugün" default view.
  const from = fromParam ? new Date(fromParam) : (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const to = toParam ? new Date(toParam) : new Date(from.getTime() + 24 * 60 * 60_000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new ValidationError("Geçersiz tarih aralığı");
  }

  const status = statusParam && VALID_STATUSES.includes(statusParam as AppointmentStatus)
    ? (statusParam as AppointmentStatus)
    : undefined;

  const appointments = await appointmentService.listAppointments(tenant.businessId, {
    from,
    to,
    employeeId,
    status,
  });
  return NextResponse.json({ appointments });
});

export const POST = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const body = await req.json();
  const input = createAppointmentSchema.parse(body);
  const appointment = await appointmentService.createAppointment(tenant.businessId, input);
  return NextResponse.json({ appointment }, { status: 201 });
});
