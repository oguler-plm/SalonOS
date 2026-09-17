import { prisma } from "@/lib/prisma";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/lib/validation/customer";

// totalVisits / totalSpent / lastVisitAt are derived from completed appointments
// rather than stored as columns, so they can never drift out of sync with the
// appointment history that produced them.
async function attachStats<T extends { id: string }>(businessId: string, customers: T[]) {
  if (customers.length === 0) return customers.map((c) => ({ ...c, totalVisits: 0, totalSpent: 0, lastVisitAt: null as Date | null }));

  const stats = await prisma.appointment.groupBy({
    by: ["customerId"],
    where: { businessId, customerId: { in: customers.map((c) => c.id) }, status: "COMPLETED" },
    _count: { _all: true },
    _sum: { price: true },
    _max: { startTime: true },
  });

  const byCustomer = new Map(stats.map((s) => [s.customerId, s]));

  return customers.map((c) => {
    const s = byCustomer.get(c.id);
    return {
      ...c,
      totalVisits: s?._count._all ?? 0,
      totalSpent: Number(s?._sum.price ?? 0),
      lastVisitAt: s?._max.startTime ?? null,
    };
  });
}

export async function listCustomers(businessId: string, opts?: { search?: string }) {
  const customers = await prisma.customer.findMany({
    where: {
      businessId,
      ...(opts?.search
        ? {
            OR: [
              { firstName: { contains: opts.search, mode: "insensitive" as const } },
              { lastName: { contains: opts.search, mode: "insensitive" as const } },
              { phone: { contains: opts.search } },
            ],
          }
        : {}),
    },
    include: { preferredEmployee: true, preferredService: true },
    orderBy: { createdAt: "desc" },
  });

  return attachStats(businessId, customers);
}

export async function findCustomerById(businessId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, businessId },
    include: {
      preferredEmployee: true,
      preferredService: true,
      appointments: {
        include: { service: true, employee: true },
        orderBy: { startTime: "desc" },
      },
    },
  });
  if (!customer) return null;

  const [withStats] = await attachStats(businessId, [customer]);
  return { ...customer, ...withStats };
}

/** Lightweight existence check — no stats attached, for use in write paths that just need to validate ownership. */
export function findCustomerRaw(businessId: string, customerId: string) {
  return prisma.customer.findFirst({ where: { id: customerId, businessId } });
}

export function findCustomerByPhone(businessId: string, phone: string) {
  return prisma.customer.findFirst({ where: { businessId, phone } });
}

export function createCustomer(businessId: string, input: CreateCustomerInput) {
  return prisma.customer.create({
    data: {
      businessId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      notes: input.notes || null,
      preferredEmployeeId: input.preferredEmployeeId || null,
      preferredServiceId: input.preferredServiceId || null,
    },
  });
}

export async function updateCustomer(businessId: string, customerId: string, input: UpdateCustomerInput) {
  const existing = await prisma.customer.findFirst({ where: { id: customerId, businessId } });
  if (!existing) return null;

  return prisma.customer.update({
    where: { id: customerId },
    data: {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.notes !== undefined && { notes: input.notes || null }),
      ...(input.preferredEmployeeId !== undefined && {
        preferredEmployeeId: input.preferredEmployeeId || null,
      }),
      ...(input.preferredServiceId !== undefined && {
        preferredServiceId: input.preferredServiceId || null,
      }),
    },
  });
}

/** Customers whose last completed visit was more than `days` ago — win-back candidates. */
export async function listLapsedCustomers(businessId: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const stats = await prisma.appointment.groupBy({
    by: ["customerId"],
    where: { businessId, status: "COMPLETED" },
    _max: { startTime: true },
  });

  const lapsedIds = stats.filter((s) => s._max.startTime && s._max.startTime < cutoff).map((s) => s.customerId);
  if (lapsedIds.length === 0) return [];

  const customers = await prisma.customer.findMany({ where: { id: { in: lapsedIds }, businessId } });
  return attachStats(businessId, customers);
}
