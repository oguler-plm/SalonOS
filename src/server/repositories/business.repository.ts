import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Registration is the one place a User is created without an existing tenant context. */
export async function createBusinessWithOwner(input: {
  businessName: string;
  slug: string;
  ownerName: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: input.businessName,
        slug: input.slug,
      },
    });

    const user = await tx.user.create({
      data: {
        businessId: business.id,
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.ownerName,
        role: "OWNER",
      },
    });

    return { business, user };
  });
}

export function findBusinessBySlug(slug: string) {
  return prisma.business.findUnique({ where: { slug } });
}

export function findBusinessById(businessId: string) {
  return prisma.business.findUnique({ where: { id: businessId } });
}

/** Maps an inbound WhatsApp message to its tenant via the number stored in settings. */
export function findBusinessByWhatsappNumber(phone: string) {
  return prisma.business.findFirst({
    where: { settings: { path: ["whatsappNumber"], equals: phone } },
  });
}

export function updateBusinessSettings(businessId: string, settings: Prisma.InputJsonValue) {
  return prisma.business.update({
    where: { id: businessId },
    data: { settings },
  });
}

export function updateBusinessProfile(businessId: string, data: { name?: string; phone?: string | null }) {
  return prisma.business.update({ where: { id: businessId }, data });
}
