import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler } from "@/lib/api-handler";
import { handleInboundWhatsappMessage } from "@/server/services/whatsapp.service";

// Meta's webhook verification handshake — this GET shape is what WhatsApp
// Business API calls once when you register the callback URL.
export const GET = apiHandler(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Doğrulama başarısız" }, { status: 403 });
});

// Meta's actual Cloud API webhook envelope. Only the parts we read are typed;
// everything else (statuses, non-text message types, etc.) is ignored below.
const webhookSchema = z.object({
  entry: z
    .array(
      z.object({
        changes: z
          .array(
            z.object({
              value: z.object({
                metadata: z.object({ phone_number_id: z.string() }).optional(),
                messages: z
                  .array(
                    z.object({
                      from: z.string(),
                      type: z.string(),
                      text: z.object({ body: z.string() }).optional(),
                    }),
                  )
                  .optional(),
              }),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

/**
 * Meta expects a fast 2xx even when we can't process a message — anything
 * else makes it retry the same payload. So every message is handled inside
 * its own try/catch and failures are only logged, never surfaced as an
 * error status.
 */
export const POST = apiHandler(async (req: Request) => {
  const body = webhookSchema.parse(await req.json());

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value.metadata?.phone_number_id;
      if (!phoneNumberId) continue;

      for (const message of change.value.messages ?? []) {
        if (message.type !== "text" || !message.text?.body) continue; // MVP: text only

        try {
          await handleInboundWhatsappMessage(phoneNumberId, message.from, message.text.body);
        } catch (error) {
          console.error("WhatsApp inbound message failed:", error);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
});
