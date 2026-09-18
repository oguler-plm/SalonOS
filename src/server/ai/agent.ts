import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_TOOLS } from "@/server/ai/tools/definitions";
import { executeAgentTool } from "@/server/ai/tools/handlers";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const MAX_TOOL_ROUNDTRIPS = 6;

const SYSTEM_PROMPT = `Sen bir berber/kuaför işletmesinin WhatsApp asistanısın. Müşterilerle Türkçe, sıcak ve kısa cümlelerle konuş.

Kurallar:
- Konuşmanın EN BAŞINDA, henüz hiçbir şey sormadan önce sessizce get_customer tool'unu çağırarak bu numaranın kayıtlı bir müşteriye ait olup olmadığını kontrol et (numarayı ayrıca sorma, sistem otomatik biliyor).
  - Kayıt bulunursa: müşteriyi ismiyle tanı, adını tekrar sorma, direkt talebine yardımcı ol.
  - Kayıt bulunmazsa: müşteriye başka HİÇBİR ŞEY sormadan önce önce ad ve soyadını sor. Ad-soyadı aldığın anda create_customer tool'unu çağırarak kaydı KENDİN otomatik aç (işletmenin manuel müşteri eklemesini bekleme, telefon numarasını sorma). Kayıt açıldıktan sonra normal akışa geç.
- Hizmet, fiyat, çalışan veya müsaitlik hakkında ASLA tahmin yürütme; her zaman ilgili tool'u çağırarak güncel veriyi al.
- Randevu oluşturmadan/taşımadan/iptal etmeden önce ilgili tool'u çağır; bu işlemleri kendi başına "yapıldı" gibi anlatma, sadece tool başarılı döndüyse onayla.
- Belirsiz bir istek geldiğinde (örn. "yarın müsait misiniz") önce get_available_slots ile kontrol et, sonra 2-3 seçenek sun.
- Asla veritabanına doğrudan erişemezsin; sadece sana tanımlı tool'ları kullanabilirsin.
- Yanıtların kısa, net ve WhatsApp'a uygun olsun (uzun paragraflar yazma).`;

export type AgentTurnResult = {
  reply: string;
  history: Anthropic.MessageParam[];
  toolCalls: { name: string; input: unknown; result: unknown }[];
};

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

/**
 * Runs one user turn through the agent loop: sends the message (+ history),
 * executes any tool calls Claude requests against our service layer, and
 * keeps looping until Claude produces a final text reply (or the round-trip
 * cap is hit, so a misbehaving loop can't run away).
 */
export async function runAgentTurn(
  businessId: string,
  customerPhone: string,
  history: Anthropic.MessageParam[],
  userMessage: string,
): Promise<AgentTurnResult> {
  const messages: Anthropic.MessageParam[] = [...history, { role: "user", content: userMessage }];
  const toolCalls: AgentTurnResult["toolCalls"] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDTRIPS; round++) {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const reply = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply, history: messages, toolCalls };
    }

    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      const result = await executeAgentTool(block.name, businessId, block.input, { customerPhone });
      toolCalls.push({ name: block.name, input: block.input, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  return {
    reply: "Şu anda talebinizi tamamlayamadım, lütfen işletmeyi doğrudan arayın.",
    history: messages,
    toolCalls,
  };
}
