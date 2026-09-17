import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { createServiceSchema } from "@/lib/validation/service";
import * as catalogService from "@/server/services/catalog.service";

export const GET = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const includeInactive = new URL(req.url).searchParams.get("includeInactive") === "true";
  const services = await catalogService.listServices(tenant.businessId, includeInactive);
  return NextResponse.json({ services });
});

export const POST = apiHandler(async (req: Request) => {
  const tenant = await requireTenant();
  const body = await req.json();
  const input = createServiceSchema.parse(body);
  const service = await catalogService.createService(tenant.businessId, input);
  return NextResponse.json({ service }, { status: 201 });
});
