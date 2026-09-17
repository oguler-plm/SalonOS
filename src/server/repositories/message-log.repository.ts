import { prisma } from "@/lib/prisma";
import type { Prisma, MessageDirection } from "@prisma/client";

export async function listRecentMessages(businessId: string, customerPhone: string, limit = 20) {
  const rows = await prisma.messageLog.findMany({
    where: { businessId, customerPhone },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.reverse();
}

export function logMessage(
  businessId: string,
  data: { customerPhone: string; direction: MessageDirection; content: string; aiToolCalls?: Prisma.InputJsonValue },
) {
  return prisma.messageLog.create({
    data: {
      businessId,
      customerPhone: data.customerPhone,
      direction: data.direction,
      content: data.content,
      aiToolCalls: data.aiToolCalls,
    },
  });
}
