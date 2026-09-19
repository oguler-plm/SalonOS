import type Anthropic from "@anthropic-ai/sdk";
import type { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/errors";
import { findBusinessByWhatsappPhoneNumberId } from "@/server/repositories/business.repository";
import * as messageLogRepo from "@/server/repositories/message-log.repository";
import { runAgentTurn } from "@/server/ai/agent";

const GRAPH_API_VERSION = "v21.0";

/**
 * Entry point for an inbound WhatsApp message. `phoneNumberId` is Meta's
 * Cloud API id for the business's WhatsApp number (from the webhook's
 * `metadata.phone_number_id`) — it, not the human-readable number, is what
 * identifies the tenant and is required to send the reply back.
 */
export async function handleInboundWhatsappMessage(
  phoneNumberId: string,
  customerPhone: string,
  text: string,
) {
  const business = await findBusinessByWhatsappPhoneNumberId(phoneNumberId);
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

  const result = await runAgentTurn(business.id, customerPhone, history, text);

  await messageLogRepo.logMessage(business.id, {
    customerPhone,
    direction: "OUT",
    content: result.reply,
    aiToolCalls: result.toolCalls.length > 0 ? (result.toolCalls as unknown as Prisma.InputJsonValue) : undefined,
  });

  await sendWhatsappMessage(phoneNumberId, customerPhone, result.reply);

  return { businessId: business.id, reply: result.reply };
}

/**
 * Sends a message through Meta's WhatsApp Cloud API. Falls back to a
 * console-log stub when WHATSAPP_ACCESS_TOKEN isn't set, so local dev and
 * businesses that haven't connected WhatsApp yet don't need real credentials.
 */
export async function sendWhatsappMessage(phoneNumberId: string, toPhone: string, text: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!accessToken) {
    console.log(`[whatsapp:stub] -> ${toPhone}: ${text}`);
    return;
  }

  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toPhone.replace(/[^\d]/g, ""),
      type: "text",
      text: { body: text },
    }),
  });

  if (!res.ok) {
    console.error("WhatsApp send failed:", res.status, await res.text());
  }
}
