import { apiRequest } from "./client";
import type { Module, ModuleWritePayload, Paginated } from "./types";

const base = "modules/";

export function listModules(params?: { course?: number; limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.course != null) sp.set("course", String(params.course));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiRequest<Paginated<Module>>({ path: q ? `${base}?${q}` : base });
}

export function getModule(id: number) {
  return apiRequest<Module>({ path: `${base}${id}/` });
}

export function createModule(body: ModuleWritePayload) {
  return apiRequest<Module>({ path: base, method: "POST", json: body });
}

export function updateModule(
  id: number,
  body: Partial<ModuleWritePayload>,
  method: "PUT" | "PATCH" = "PATCH"
) {
  return apiRequest<Module>({ path: `${base}${id}/`, method, json: body });
}

export function deleteModule(id: number) {
  return apiRequest<void>({ path: `${base}${id}/`, method: "DELETE" });
}
