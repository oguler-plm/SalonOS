import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler } from "@/lib/api-handler";
import { handleInboundWhatsappMessage, sendWhatsappMessage } from "@/server/services/whatsapp.service";

// Meta's webhook verification handshake — this GET shape is what WhatsApp
// Business API calls once when you register the callback URL. Keeping it
// correct now means the real integration is a config change, not a rewrite.
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

// Placeholder inbound payload shape until the real WhatsApp Business API is
// wired up — swap this schema for Meta's actual webhook body when that happens.
const inboundSchema = z.object({
  businessPhone: z.string(),
  customerPhone: z.string(),
  text: z.string().min(1),
});

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const { businessPhone, customerPhone, text } = inboundSchema.parse(body);

  const { reply } = await handleInboundWhatsappMessage(businessPhone, customerPhone, text);
  await sendWhatsappMessage(customerPhone, reply);

  return NextResponse.json({ ok: true });
});
