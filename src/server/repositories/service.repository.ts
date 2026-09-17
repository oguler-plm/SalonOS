import { prisma } from "@/lib/prisma";
import type { CreateServiceInput, UpdateServiceInput } from "@/lib/validation/service";

export function listServices(businessId: string, opts?: { includeInactive?: boolean }) {
  return prisma.service.findMany({
    where: {
      businessId,
      ...(opts?.includeInactive ? {} : { isActive: true }),
    },
    orderBy: { name: "asc" },
  });
}

export function findServiceById(businessId: string, serviceId: string) {
  return prisma.service.findFirst({ where: { id: serviceId, businessId } });
}

export function findServicesByIds(businessId: string, serviceIds: string[]) {
  return prisma.service.findMany({ where: { id: { in: serviceIds }, businessId } });
}

export function createService(businessId: string, input: CreateServiceInput) {
  return prisma.service.create({
    data: {
      businessId,
      name: input.name,
      price: input.price,
      durationMinutes: input.durationMinutes,
      isActive: input.isActive,
    },
  });
}

export async function updateService(businessId: string, serviceId: string, input: UpdateServiceInput) {
  const existing = await prisma.service.findFirst({ where: { id: serviceId, businessId } });
  if (!existing) return null;

  return prisma.service.update({
    where: { id: serviceId },
    data: input,
  });
}

export async function deactivateService(businessId: string, serviceId: string) {
  const existing = await prisma.service.findFirst({ where: { id: serviceId, businessId } });
  if (!existing) return null;

  return prisma.service.update({ where: { id: serviceId }, data: { isActive: false } });
}
