import { NotFoundError } from "@/lib/errors";
import * as repo from "@/server/repositories/customer.repository";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/lib/validation/customer";

export function listCustomers(businessId: string, search?: string) {
  return repo.listCustomers(businessId, { search });
}

export async function getCustomer(businessId: string, customerId: string) {
  const customer = await repo.findCustomerById(businessId, customerId);
  if (!customer) throw new NotFoundError("Müşteri bulunamadı");
  return customer;
}

export function findOrNull(businessId: string, customerId: string) {
  return repo.findCustomerById(businessId, customerId);
}

export function findByPhone(businessId: string, phone: string) {
  return repo.findCustomerByPhone(businessId, phone);
}

export function createCustomer(businessId: string, input: CreateCustomerInput) {
  return repo.createCustomer(businessId, input);
}

export async function updateCustomer(businessId: string, customerId: string, input: UpdateCustomerInput) {
  const updated = await repo.updateCustomer(businessId, customerId, input);
  if (!updated) throw new NotFoundError("Müşteri bulunamadı");
  return updated;
}

/** Powers the "geri kazanma" (win-back) signal: customers who haven't returned in `days` days. */
export function listLapsedCustomers(businessId: string, days = 45) {
  return repo.listLapsedCustomers(businessId, days);
}
