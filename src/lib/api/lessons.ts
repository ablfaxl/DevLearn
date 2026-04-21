import { apiRequest } from "./client";
import type { Lesson, LessonDetail, LessonWritePayload, Paginated } from "./types";

const base = "lessons/";

export function listLessons(params?: { module?: number; limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.module != null) sp.set("module", String(params.module));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiRequest<Paginated<Lesson>>({ path: q ? `${base}?${q}` : base });
}

export function getLesson(id: number) {
  return apiRequest<LessonDetail>({ path: `${base}${id}/` });
}

export function createLesson(body: LessonWritePayload) {
  return apiRequest<Lesson>({ path: base, method: "POST", json: body });
}

export function updateLesson(
  id: number,
  body: Partial<Pick<LessonWritePayload, "title" | "content_type">>,
  method: "PUT" | "PATCH" = "PATCH"
) {
  return apiRequest<Lesson>({ path: `${base}${id}/`, method, json: body });
}

export function deleteLesson(id: number) {
  return apiRequest<void>({ path: `${base}${id}/`, method: "DELETE" });
}
