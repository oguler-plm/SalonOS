import { getDashboardCounts } from "@/server/repositories/appointment.repository";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Pazar
  const diff = day === 0 ? -6 : 1 - day; // hafta Pazartesi başlasın
  d.setDate(d.getDate() + diff);
  return d;
}

export async function getDashboardSummary(businessId: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60_000);

  const [
    todayCount,
    todayCompleted,
    todayPending,
    todayRevenue,
    weekRevenue,
    newCustomersThisWeek,
    todayNoShow,
  ] = await getDashboardCounts(businessId, dayStart, dayEnd, weekStart, weekEnd);

  return {
    todayAppointmentCount: todayCount,
    todayCompletedCount: todayCompleted,
    todayPendingCount: todayPending,
    todayRevenue: Number(todayRevenue._sum.price ?? 0),
    weekRevenue: Number(weekRevenue._sum.price ?? 0),
    newCustomersThisWeek,
    todayNoShowCount: todayNoShow,
  };
}
