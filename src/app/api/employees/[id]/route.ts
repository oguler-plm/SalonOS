import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { updateEmployeeSchema } from "@/lib/validation/employee";
import * as employeeService from "@/server/services/employee.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const employee = await employeeService.getEmployee(tenant.businessId, id);
  return NextResponse.json({ employee });
});

export const PATCH = apiHandler(async (req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const body = await req.json();
  const input = updateEmployeeSchema.parse(body);
  const employee = await employeeService.updateEmployee(tenant.businessId, id, input);
  return NextResponse.json({ employee });
});
