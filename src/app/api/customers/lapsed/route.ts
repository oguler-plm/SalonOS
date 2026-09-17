import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import * as customerService from "@/server/services/customer.service";

export const GET = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const daysParam = new URL(req.url).searchParams.get("days");
  const days = daysParam ? Number(daysParam) : 45;
  const customers = await customerService.listLapsedCustomers(tenant.businessId, days);
  return NextResponse.json({ customers });
});
