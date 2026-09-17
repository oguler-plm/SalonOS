import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { timeOffSchema } from "@/lib/validation/employee";
import * as employeeService from "@/server/services/employee.service";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = apiHandler(async (req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const body = await req.json();
  const input = timeOffSchema.parse(body);
  const timeOff = await employeeService.addTimeOff(tenant.businessId, id, input);
  return NextResponse.json({ timeOff }, { status: 201 });
});
