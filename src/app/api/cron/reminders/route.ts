import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { sendDueReminders } from "@/server/services/reminder.service";

/**
 * Serverless-friendly entry point for the reminder scan. The in-process
 * node-cron scheduler (src/server/jobs/reminder.job.ts) only works on a
 * long-running server (Docker/self-host) — on Vercel each invocation is a
 * fresh, short-lived function, so the schedule has to live outside the app:
 * Vercel Cron (see vercel.json) or an external pinger (e.g. cron-job.org)
 * hitting this route every ~15 minutes.
 */
export const GET = apiHandler(async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const result = await sendDueReminders();
  return NextResponse.json(result);
});
