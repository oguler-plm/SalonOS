import type Anthropic from "@anthropic-ai/sdk";

/**
 * Tool surface exposed to the AI agent. Every tool is a thin, validated
 * wrapper around the same service-layer functions the UI/API routes use —
 * the AI never touches Prisma directly, and every mutation still goes
 * through the conflict checks and validation in src/server/services/*.
 */
export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_services",
    description: "İşletmenin sunduğu aktif hizmetleri (isim, fiyat, süre) listeler.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_employees",
    description: "İşletmenin aktif çalışanlarını listeler. serviceId verilirse sadece o hizmeti verebilen çalışanları döner.",
    input_schema: {
      type: "object",
      properties: {
        serviceId: { type: "string", description: "Belirli bir hizmeti verebilen çalışanlarla filtrelemek için hizmet id'si" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_available_slots",
    description: "Belirli bir tarih ve hizmet için müsait randevu saatlerini döner. employeeId verilirse sadece o çalışan için bakar.",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "YYYY-MM-DD formatında tarih" },
        serviceId: { type: "string", description: "Hizmet id'si" },
        employeeId: { type: "string", description: "Opsiyonel: belirli bir çalışan id'si" },
      },
      required: ["date", "serviceId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_customer",
    description: "Telefon numarasına göre müşteri kaydını arar. Kayıt yoksa null döner.",
    input_schema: {
      type: "object",
      properties: {
        phone: { type: "string", description: "Müşterinin telefon numarası" },
      },
      required: ["phone"],
      additionalProperties: false,
    },
  },
  {
    name: "create_customer",
    description: "Sistemde kaydı olmayan bir müşteri için yeni müşteri kaydı oluşturur.",
    input_schema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        phone: { type: "string" },
      },
      required: ["firstName", "lastName", "phone"],
      additionalProperties: false,
    },
  },
  {
    name: "create_appointment",
    description: "Yeni bir randevu oluşturur. Önce get_available_slots ile müsaitlik kontrol edilmeli.",
    input_schema: {
      type: "object",
      properties: {
        customerId: { type: "string" },
        employeeId: { type: "string" },
        serviceId: { type: "string" },
        startTime: { type: "string", description: "ISO 8601 tarih-saat, ör. 2026-09-15T14:00:00+03:00" },
      },
      required: ["customerId", "employeeId", "serviceId", "startTime"],
      additionalProperties: false,
    },
  },
  {
    name: "reschedule_appointment",
    description: "Var olan bir randevuyu yeni bir tarih/saate taşır.",
    input_schema: {
      type: "object",
      properties: {
        appointmentId: { type: "string" },
        startTime: { type: "string", description: "ISO 8601 tarih-saat" },
        employeeId: { type: "string", description: "Opsiyonel: çalışan da değişecekse" },
      },
      required: ["appointmentId", "startTime"],
      additionalProperties: false,
    },
  },
  {
    name: "cancel_appointment",
    description: "Var olan bir randevuyu iptal eder.",
    input_schema: {
      type: "object",
      properties: {
        appointmentId: { type: "string" },
      },
      required: ["appointmentId"],
      additionalProperties: false,
    },
  },
];
