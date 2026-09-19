import * as repo from "@/server/repositories/reminder.repository";
import { sendWhatsappMessage } from "@/server/services/whatsapp.service";

const REMINDER_LEAD_HOURS = 24;
// Must be >= the gap between two runs, or an appointment can fall in the gap
// and never get reminded. Self-hosted (node-cron, every 15 min) only needs a
// slim window, but Vercel's free-tier Cron collapses any schedule to once a
// day — a wide window here is what makes that still work: the same
// appointment gets rescanned by every run until it's caught, and the
// reminderLogs dedupe in the repository query means a wider window never
// sends a duplicate reminder, just gives more chances to catch it.
const WINDOW_MINUTES = 25 * 60;

function formatReminderText(customerName: string, serviceName: string, startTime: Date) {
  const time = startTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const date = startTime.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return `Merhaba ${customerName}, ${date} saat ${time}'te ${serviceName} randevunuz bulunmaktadır.`;
}

/** Finds appointments ~24h out, logs a reminder, and sends it if a WhatsApp channel is configured. */
export async function sendDueReminders() {
  const now = new Date();
  const windowStart = new Date(now.getTime() + REMINDER_LEAD_HOURS * 60 * 60_000);
  const windowEnd = new Date(windowStart.getTime() + WINDOW_MINUTES * 60_000);

  const appointments = await repo.findAppointmentsNeedingReminder(windowStart, windowEnd);
  let sent = 0;

  for (const appt of appointments) {
    const log = await repo.createReminderLog(appt.id, appt.startTime);

    const settings = appt.business.settings as { whatsappPhoneNumberId?: string } | null;
    const phoneNumberId = settings?.whatsappPhoneNumberId;

    if (!phoneNumberId) continue; // stays PENDING — no channel wired up yet

    try {
      const text = formatReminderText(`${appt.customer.firstName} ${appt.customer.lastName}`, appt.service.name, appt.startTime);
      await sendWhatsappMessage(phoneNumberId, appt.customer.phone, text);
      await repo.markReminderSent(log.id);
      sent += 1;
    } catch (error) {
      await repo.markReminderFailed(log.id, error instanceof Error ? error.message : "Bilinmeyen hata");
    }
  }

  return { scanned: appointments.length, sent };
}
