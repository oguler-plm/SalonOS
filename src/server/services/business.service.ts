import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  createBusinessWithOwner,
  findBusinessById,
  updateBusinessProfile,
  updateBusinessSettings,
} from "@/server/repositories/business.repository";
import type { RegisterInput } from "@/lib/validation/auth";

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "isletme";
  let candidate = root;
  let suffix = 1;
  // Small, bounded loop — collisions are rare, and business creation is not high-throughput.
  while (await prisma.business.findUnique({ where: { slug: candidate } })) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
  return candidate;
}

export async function registerBusiness(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new ConflictError("Bu e-posta adresi zaten kullanılıyor");
  }

  const slug = await uniqueSlug(input.businessName);
  const passwordHash = await bcrypt.hash(input.password, 12);

  const { business, user } = await createBusinessWithOwner({
    businessName: input.businessName,
    slug,
    ownerName: input.ownerName,
    email: input.email,
    passwordHash,
  });

  return { business, user };
}

export function getBusiness(businessId: string) {
  return findBusinessById(businessId);
}

export async function updateProfile(businessId: string, input: { name?: string; phone?: string; whatsappNumber?: string }) {
  const business = await findBusinessById(businessId);
  if (!business) throw new NotFoundError("İşletme bulunamadı");

  if (input.name !== undefined || input.phone !== undefined) {
    await updateBusinessProfile(businessId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
    });
  }

  if (input.whatsappNumber !== undefined) {
    const currentSettings = (business.settings as Record<string, unknown>) ?? {};
    await updateBusinessSettings(businessId, { ...currentSettings, whatsappNumber: input.whatsappNumber });
  }

  const updated = await findBusinessById(businessId);
  if (!updated) throw new NotFoundError("İşletme bulunamadı");
  return updated;
}
