import "server-only";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import type { TenantContext } from "@/types/tenant";

/** Resolves the current session into a tenant context, or throws 401. */
export async function requireTenant(): Promise<TenantContext> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return {
    businessId: session.user.businessId,
    userId: session.user.id,
    role: session.user.role,
  };
}

/** Same as requireTenant, but also enforces a minimum role. */
export async function requireRole(...allowed: Role[]): Promise<TenantContext> {
  const tenant = await requireTenant();
  if (!allowed.includes(tenant.role)) {
    throw new ForbiddenError();
  }
  return tenant;
}
