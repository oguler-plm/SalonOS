import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { createCustomerSchema } from "@/lib/validation/customer";
import * as customerService from "@/server/services/customer.service";

export const GET = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const search = new URL(req.url).searchParams.get("search") ?? undefined;
  const customers = await customerService.listCustomers(tenant.businessId, search);
  return NextResponse.json({ customers });
});

export const POST = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const body = await req.json();
  const input = createCustomerSchema.parse(body);
  const customer = await customerService.createCustomer(tenant.businessId, input);
  return NextResponse.json({ customer }, { status: 201 });
});
