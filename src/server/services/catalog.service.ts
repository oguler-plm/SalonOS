import { NotFoundError } from "@/lib/errors";
import * as repo from "@/server/repositories/service.repository";
import type { CreateServiceInput, UpdateServiceInput } from "@/lib/validation/service";

export function listServices(businessId: string, includeInactive = false) {
  return repo.listServices(businessId, { includeInactive });
}

export async function getService(businessId: string, serviceId: string) {
  const service = await repo.findServiceById(businessId, serviceId);
  if (!service) throw new NotFoundError("Hizmet bulunamadı");
  return service;
}

export function createService(businessId: string, input: CreateServiceInput) {
  return repo.createService(businessId, input);
}

export async function updateService(businessId: string, serviceId: string, input: UpdateServiceInput) {
  const updated = await repo.updateService(businessId, serviceId, input);
  if (!updated) throw new NotFoundError("Hizmet bulunamadı");
  return updated;
}

export async function deactivateService(businessId: string, serviceId: string) {
  const updated = await repo.deactivateService(businessId, serviceId);
  if (!updated) throw new NotFoundError("Hizmet bulunamadı");
  return updated;
}
