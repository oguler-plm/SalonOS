import "server-only";
import cron from "node-cron";
import { sendDueReminders } from "@/server/services/reminder.service";

declare global {
  var __reminderJobStarted: boolean | undefined;
}

/** Starts the in-process reminder scheduler. Called once from instrumentation.ts on server boot. */
export function startReminderJob() {
  if (globalThis.__reminderJobStarted) return; // avoid double-scheduling on hot reload
  globalThis.__reminderJobStarted = true;

  // Every 15 minutes — comfortably inside reminder.service's 20-minute scan window.
  cron.schedule("*/15 * * * *", async () => {
    try {
      const result = await sendDueReminders();
      if (result.scanned > 0) {
        console.log(`[reminder-job] ${result.sent}/${result.scanned} hatırlatma gönderildi`);
      }
    } catch (error) {
      console.error("[reminder-job] failed:", error);
    }
  });

  console.log("[reminder-job] started (every 15 minutes)");
}
