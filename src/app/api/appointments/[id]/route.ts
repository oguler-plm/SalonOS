import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { rescheduleAppointmentSchema } from "@/lib/validation/appointment";
import * as appointmentService from "@/server/services/appointment.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const appointment = await appointmentService.getAppointment(tenant.businessId, id);
  return NextResponse.json({ appointment });
});

// Reschedule (date/time and optionally employee). Status changes go through /status.
export const PATCH = apiHandler(async (req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const body = await req.json();
  const input = rescheduleAppointmentSchema.parse(body);
  const appointment = await appointmentService.rescheduleAppointment(tenant.businessId, id, input);
  return NextResponse.json({ appointment });
});

export const DELETE = apiHandler(async (_req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const appointment = await appointmentService.cancelAppointment(tenant.businessId, id);
  return NextResponse.json({ appointment });
});
