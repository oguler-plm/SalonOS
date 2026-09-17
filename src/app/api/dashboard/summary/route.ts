import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { getDashboardSummary } from "@/server/services/dashboard.service";

export const GET = apiHandler(async () => {
  const tenant = await requireTenant();
  const summary = await getDashboardSummary(tenant.businessId);
  return NextResponse.json({ summary });
});
