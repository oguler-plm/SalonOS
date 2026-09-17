import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const business = await prisma.business.upsert({
    where: { slug: "demo-berber" },
    update: {},
    create: {
      name: "Demo Berber",
      slug: "demo-berber",
      phone: "+90 555 000 00 00",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@salonos.test" },
    update: {},
    create: {
      businessId: business.id,
      email: "demo@salonos.test",
      passwordHash,
      name: "Demo Sahibi",
      role: "OWNER",
    },
  });

  // Tipik bir erkek berberi hizmet menüsü — temel üçlü (kesim/sakal/kombin)
  // artı sık talep edilen ek hizmetler.
  const serviceData = [
    { key: "haircut", name: "Saç Kesimi", price: 400, durationMinutes: 45 },
    { key: "beard", name: "Sakal Tıraşı", price: 250, durationMinutes: 20 },
    { key: "combo", name: "Saç + Sakal", price: 600, durationMinutes: 60 },
    { key: "kidsHaircut", name: "Çocuk Saç Kesimi", price: 300, durationMinutes: 30 },
    { key: "styling", name: "Fön / Şekillendirme", price: 150, durationMinutes: 15 },
    { key: "beardDesign", name: "Sakal Şekillendirme (Dizayn)", price: 300, durationMinutes: 25 },
    { key: "facial", name: "Cilt / Yüz Bakımı", price: 350, durationMinutes: 30 },
    { key: "hairColor", name: "Saç Boyama", price: 500, durationMinutes: 45 },
    { key: "eyebrow", name: "Kaş Alımı", price: 100, durationMinutes: 10 },
    { key: "vipPackage", name: "Kral Tıraşı (Saç + Sakal + Bakım Paketi)", price: 850, durationMinutes: 75 },
  ] as const;

  const createdServices = Object.fromEntries(
    await Promise.all(
      serviceData.map(async (s) => [
        s.key,
        await prisma.service.create({
          data: { businessId: business.id, name: s.name, price: s.price, durationMinutes: s.durationMinutes },
        }),
      ]),
    ),
  ) as Record<(typeof serviceData)[number]["key"], { id: string }>;

  const { haircut, beard, combo, kidsHaircut, styling, beardDesign, facial, hairColor, eyebrow, vipPackage } =
    createdServices;

  const workSchedules = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    startTime: "09:00",
    endTime: "19:00",
    isOff: false,
  }));

  await prisma.employee.create({
    data: {
      businessId: business.id,
      name: "Ahmet",
      phone: "+90 555 111 11 11",
      workSchedules: { create: workSchedules },
      employeeServices: {
        create: [
          { serviceId: haircut.id },
          { serviceId: beard.id },
          { serviceId: combo.id },
          { serviceId: kidsHaircut.id },
          { serviceId: styling.id },
          { serviceId: beardDesign.id },
          { serviceId: vipPackage.id },
        ],
      },
    },
  });

  await prisma.employee.create({
    data: {
      businessId: business.id,
      name: "Mehmet",
      phone: "+90 555 222 22 22",
      workSchedules: { create: workSchedules },
      employeeServices: {
        create: [
          { serviceId: haircut.id },
          { serviceId: combo.id },
          { serviceId: facial.id },
          { serviceId: hairColor.id },
          { serviceId: eyebrow.id },
        ],
      },
    },
  });

  console.log("Seed tamamlandı. Giriş: demo@salonos.test / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
