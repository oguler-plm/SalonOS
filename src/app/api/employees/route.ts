import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { createEmployeeSchema } from "@/lib/validation/employee";
import * as employeeService from "@/server/services/employee.service";

export const GET = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const includeInactive = new URL(req.url).searchParams.get("includeInactive") === "true";
  const employees = await employeeService.listEmployees(tenant.businessId, includeInactive);
  return NextResponse.json({ employees });
});

export const POST = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const body = await req.json();
  const input = createEmployeeSchema.parse(body);
  const employee = await employeeService.createEmployee(tenant.businessId, input);
  return NextResponse.json({ employee }, { status: 201 });
});
