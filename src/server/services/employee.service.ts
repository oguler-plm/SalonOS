import { NotFoundError, ValidationError } from "@/lib/errors";
import * as repo from "@/server/repositories/employee.repository";
import { findServicesByIds } from "@/server/repositories/service.repository";
import type { CreateEmployeeInput, UpdateEmployeeInput, TimeOffInput } from "@/lib/validation/employee";

async function assertServicesBelongToBusiness(businessId: string, serviceIds: string[]) {
  if (serviceIds.length === 0) return;
  const found = await findServicesByIds(businessId, serviceIds);
  if (found.length !== serviceIds.length) {
    throw new ValidationError("Seçilen hizmetlerden biri bu işletmeye ait değil");
  }
}

export function listEmployees(businessId: string, includeInactive = false) {
  return repo.listEmployees(businessId, { includeInactive });
}

export async function getEmployee(businessId: string, employeeId: string) {
  const employee = await repo.findEmployeeById(businessId, employeeId);
  if (!employee) throw new NotFoundError("Çalışan bulunamadı");
  return employee;
}

export async function createEmployee(businessId: string, input: CreateEmployeeInput) {
  await assertServicesBelongToBusiness(businessId, input.serviceIds);
  return repo.createEmployee(businessId, input);
}

export async function updateEmployee(businessId: string, employeeId: string, input: UpdateEmployeeInput) {
  if (input.serviceIds) {
    await assertServicesBelongToBusiness(businessId, input.serviceIds);
  }
  const updated = await repo.updateEmployee(businessId, employeeId, input);
  if (!updated) throw new NotFoundError("Çalışan bulunamadı");
  return updated;
}

export async function addTimeOff(businessId: string, employeeId: string, input: TimeOffInput) {
  const created = await repo.addTimeOff(businessId, employeeId, input);
  if (!created) throw new NotFoundError("Çalışan bulunamadı");
  return created;
}
