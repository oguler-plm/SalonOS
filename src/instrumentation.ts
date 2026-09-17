export async function register() {
  // Only the Node.js server runtime can run node-cron (not the Edge runtime).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startReminderJob } = await import("@/server/jobs/reminder.job");
    startReminderJob();
  }
}
