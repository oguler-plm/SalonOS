import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { updateCustomerSchema } from "@/lib/validation/customer";
import * as customerService from "@/server/services/customer.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const customer = await customerService.getCustomer(tenant.businessId, id);
  return NextResponse.json({ customer });
});

export const PATCH = apiHandler(async (req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const body = await req.json();
  const input = updateCustomerSchema.parse(body);
  const customer = await customerService.updateCustomer(tenant.businessId, id, input);
  return NextResponse.json({ customer });
});
