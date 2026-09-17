import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { availableSlotsQuerySchema } from "@/lib/validation/appointment";
import * as appointmentService from "@/server/services/appointment.service";

export const GET = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const params = new URL(req.url).searchParams;
  const query = availableSlotsQuerySchema.parse({
    date: params.get("date"),
    serviceId: params.get("serviceId"),
    employeeId: params.get("employeeId") ?? undefined,
  });

  const slots = await appointmentService.getAvailableSlots(tenant.businessId, query);
  return NextResponse.json({ slots });
});
