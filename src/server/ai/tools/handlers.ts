import { z } from "zod";
import { AppError } from "@/lib/errors";
import * as catalogService from "@/server/services/catalog.service";
import * as employeeService from "@/server/services/employee.service";
import * as customerService from "@/server/services/customer.service";
import * as appointmentService from "@/server/services/appointment.service";
import { createCustomerSchema } from "@/lib/validation/customer";
import { availableSlotsQuerySchema, rescheduleAppointmentSchema } from "@/lib/validation/appointment";

type ToolHandler = (businessId: string, rawInput: unknown) => Promise<unknown>;

function money(value: unknown): number {
  return Number(value);
}

const getEmployeesInput = z.object({ serviceId: z.string().optional() });
const getCustomerInput = z.object({ phone: z.string().min(3) });
const createAppointmentInput = z.object({
  customerId: z.string(),
  employeeId: z.string(),
  serviceId: z.string(),
  startTime: z.string(),
});
const cancelAppointmentInput = z.object({ appointmentId: z.string() });
const rescheduleInput = rescheduleAppointmentSchema.extend({ appointmentId: z.string() });

async function getServicesHandler(businessId: string) {
  const services = await catalogService.listServices(businessId);
  return services.map((s) => ({
    id: s.id,
    name: s.name,
    price: money(s.price),
    durationMinutes: s.durationMinutes,
  }));
}

async function getEmployeesHandler(businessId: string, rawInput: unknown) {
  const { serviceId } = getEmployeesInput.parse(rawInput ?? {});
  const employees = await employeeService.listEmployees(businessId);
  const filtered = serviceId
    ? employees.filter((e) => e.employeeServices.some((es) => es.serviceId === serviceId))
    : employees;
  return filtered.map((e) => ({ id: e.id, name: e.name }));
}

async function getAvailableSlotsHandler(businessId: string, rawInput: unknown) {
  const input = availableSlotsQuerySchema.parse(rawInput);
  const slots = await appointmentService.getAvailableSlots(businessId, input);
  return slots;
}

async function getCustomerHandler(businessId: string, rawInput: unknown) {
  const { phone } = getCustomerInput.parse(rawInput);
  const customer = await customerService.findByPhone(businessId, phone);
  if (!customer) return null;
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
  };
}

async function createCustomerHandler(businessId: string, rawInput: unknown) {
  const input = createCustomerSchema.parse(rawInput);
  const customer = await customerService.createCustomer(businessId, input);
  return { id: customer.id, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone };
}

async function createAppointmentHandler(businessId: string, rawInput: unknown) {
  const input = createAppointmentInput.parse(rawInput);
  const appointment = await appointmentService.createAppointment(businessId, {
    ...input,
    source: "AI_AGENT",
  });
  return {
    id: appointment.id,
    status: appointment.status,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    employeeName: appointment.employee.name,
    serviceName: appointment.service.name,
    price: money(appointment.price),
  };
}

async function rescheduleAppointmentHandler(businessId: string, rawInput: unknown) {
  const { appointmentId, ...rest } = rescheduleInput.parse(rawInput);
  const appointment = await appointmentService.rescheduleAppointment(businessId, appointmentId, rest);
  return {
    id: appointment.id,
    status: appointment.status,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    employeeName: appointment.employee.name,
  };
}

async function cancelAppointmentHandler(businessId: string, rawInput: unknown) {
  const { appointmentId } = cancelAppointmentInput.parse(rawInput);
  const appointment = await appointmentService.cancelAppointment(businessId, appointmentId);
  return { id: appointment.id, status: appointment.status };
}

const HANDLERS: Record<string, ToolHandler> = {
  get_services: getServicesHandler,
  get_employees: getEmployeesHandler,
  get_available_slots: getAvailableSlotsHandler,
  get_customer: getCustomerHandler,
  create_customer: createCustomerHandler,
  create_appointment: createAppointmentHandler,
  reschedule_appointment: rescheduleAppointmentHandler,
  cancel_appointment: cancelAppointmentHandler,
};

/**
 * Executes one tool call and always returns a JSON-serializable result — errors
 * are caught and turned into `{ error: message }` so the agent loop can feed
 * them back to Claude as a tool_result instead of crashing the conversation.
 */
export async function executeAgentTool(name: string, businessId: string, rawInput: unknown): Promise<unknown> {
  const handler = HANDLERS[name];
  if (!handler) {
    return { error: `Bilinmeyen tool: ${name}` };
  }
  try {
    return await handler(businessId, rawInput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Geçersiz tool girdisi", issues: error.issues };
    }
    if (error instanceof AppError) {
      return { error: error.message };
    }
    console.error(`AI tool "${name}" failed:`, error);
    return { error: "Beklenmeyen bir hata oluştu" };
  }
}
