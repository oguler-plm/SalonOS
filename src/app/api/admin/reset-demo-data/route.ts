import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

/**
 * TEMPORARY one-off endpoint: resets a single business's services/employees
 * to the standard demo catalog (same data as prisma/seed.ts). Guarded by
 * ADMIN_RESET_SECRET so it can't be hit without the header. Delete this route
 * (and the env var) once the one-time reset has been run.
 */
export const POST = apiHandler(async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!process.env.ADMIN_RESET_SECRET || authHeader !== `Bearer ${process.env.ADMIN_RESET_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { slug } = await req.json();
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) {
    return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
  }

  await prisma.employee.deleteMany({ where: { businessId: business.id } });
  await prisma.service.deleteMany({ where: { businessId: business.id } });

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

  return NextResponse.json({ ok: true });
});
