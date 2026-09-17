import type { Role } from "@prisma/client";

export type TenantContext = {
  businessId: string;
  userId: string;
  role: Role;
};
