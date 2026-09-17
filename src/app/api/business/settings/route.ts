import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/session";
import { updateBusinessSchema } from "@/lib/validation/business";
import * as businessService from "@/server/services/business.service";

export const GET = apiHandler(async () => {
  const tenant = await requireRole("OWNER", "MANAGER", "EMPLOYEE");
  const business = await businessService.getBusiness(tenant.businessId);
  return NextResponse.json({ business });
});

export const PATCH = apiHandler(async (req: Request) => {
  const tenant = await requireRole("OWNER", "MANAGER");
  const body = await req.json();
  const input = updateBusinessSchema.parse(body);
  const business = await businessService.updateProfile(tenant.businessId, input);
  return NextResponse.json({ business });
});
