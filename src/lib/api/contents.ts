import { apiRequest } from "./client";
import type { Content, ContentWritePayload, Paginated } from "./types";

const base = "contents/";

export function listContents(params?: { lesson?: number; limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.lesson != null) sp.set("lesson", String(params.lesson));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiRequest<Paginated<Content>>({ path: q ? `${base}?${q}` : base });
}

export function getContent(id: number) {
  return apiRequest<Content>({ path: `${base}${id}/` });
}

export function createContentJson(
  body: ContentWritePayload & { content?: string; order?: number }
) {
  return apiRequest<Content>({ path: base, method: "POST", json: body });
}

export function createContentMultipart(formData: FormData) {
  return apiRequest<Content>({
    path: base,
    method: "POST",
    formData,
    skipJsonHeaders: true,
  });
}

export function updateContentJson(
  id: number,
  body: Partial<Pick<Content, "title" | "content_type" | "content" | "order">>,
  method: "PUT" | "PATCH" = "PATCH"
) {
  return apiRequest<Content>({ path: `${base}${id}/`, method, json: body });
}

export function updateContentMultipart(id: number, formData: FormData) {
  return apiRequest<Content>({
    path: `${base}${id}/`,
    method: "PATCH",
    formData,
    skipJsonHeaders: true,
  });
}

export function deleteContent(id: number) {
  return apiRequest<void>({ path: `${base}${id}/`, method: "DELETE" });
}
