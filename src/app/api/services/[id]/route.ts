import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireTenant } from "@/lib/session";
import { updateServiceSchema } from "@/lib/validation/service";
import * as catalogService from "@/server/services/catalog.service";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const service = await catalogService.getService(tenant.businessId, id);
  return NextResponse.json({ service });
});

export const PATCH = apiHandler(async (req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const body = await req.json();
  const input = updateServiceSchema.parse(body);
  const service = await catalogService.updateService(tenant.businessId, id, input);
  return NextResponse.json({ service });
});

// Soft delete — a service with historical appointments must not disappear from past records.
export const DELETE = apiHandler(async (_req: Request, { params }: RouteContext) => {
  const tenant = await requireTenant();
  const { id } = await params;
  const service = await catalogService.deactivateService(tenant.businessId, id);
  return NextResponse.json({ service });
});
