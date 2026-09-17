import type Anthropic from "@anthropic-ai/sdk";
import type { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/errors";
import { findBusinessByWhatsappNumber } from "@/server/repositories/business.repository";
import * as messageLogRepo from "@/server/repositories/message-log.repository";
import { runAgentTurn } from "@/server/ai/agent";

/**
 * Entry point for an inbound WhatsApp message. This is architecture, not a
 * live integration — swap the caller (the webhook route) for the real
 * WhatsApp Business API payload shape once that's wired up; everything below
 * this line (tenant resolution, history, the agent loop, logging) stays the same.
 */
export async function handleInboundWhatsappMessage(
  businessPhone: string,
  customerPhone: string,
  text: string,
) {
  const business = await findBusinessByWhatsappNumber(businessPhone);
  if (!business) {
    throw new NotFoundError("Bu WhatsApp numarasına bağlı bir işletme bulunamadı");
  }

  const recent = await messageLogRepo.listRecentMessages(business.id, customerPhone);
  const history: Anthropic.MessageParam[] = recent.map((m) => ({
    role: m.direction === "IN" ? "user" : "assistant",
    content: m.content,
  }));

  await messageLogRepo.logMessage(business.id, {
    customerPhone,
    direction: "IN",
    content: text,
  });

  const result = await runAgentTurn(business.id, history, text);

  await messageLogRepo.logMessage(business.id, {
    customerPhone,
    direction: "OUT",
    content: result.reply,
    aiToolCalls: result.toolCalls.length > 0 ? (result.toolCalls as unknown as Prisma.InputJsonValue) : undefined,
  });

  return { businessId: business.id, reply: result.reply };
}

/**
 * TODO: real WhatsApp Business API send call. For MVP this only logs —
 * see MessageLog for the outbound record. Wiring this up is the one piece
 * that turns this skeleton into a live integration.
 */
export async function sendWhatsappMessage(toPhone: string, text: string) {
  console.log(`[whatsapp:stub] -> ${toPhone}: ${text}`);
}
