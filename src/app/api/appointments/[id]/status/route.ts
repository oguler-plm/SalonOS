import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { updateAppointmentStatusSchema } from "@/lib/validation/appointment";
import * as appointmentService from "@/server/services/appointment.service";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = apiHandler(async (req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const body = await req.json();
  const { status } = updateAppointmentStatusSchema.parse(body);
  const appointment = await appointmentService.updateAppointmentStatus(tenant.businessId, id, status);
  return NextResponse.json({ appointment });
});
