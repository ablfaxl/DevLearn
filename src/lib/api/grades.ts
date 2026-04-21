import { apiRequest } from "./client";
import type { Grade, Paginated } from "./types";

const base = "grades/";

export function getGrade(id: number) {
  return apiRequest<Grade>({ path: `${base}${id}/` });
}

export function listGrades(params?: { course?: number; limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.course != null) sp.set("course", String(params.course));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiRequest<Paginated<Grade>>({ path: q ? `${base}?${q}` : base });
}

/** PRD: PATCH /grades/:id — instructor updates score/feedback. */
export function updateGrade(
  id: number,
  body: Partial<Pick<Grade, "score" | "feedback">>,
  method: "PUT" | "PATCH" = "PATCH"
) {
  return apiRequest<Grade>({ path: `${base}${id}/`, method, json: body });
}
