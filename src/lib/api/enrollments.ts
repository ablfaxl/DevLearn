import { apiRequest } from "./client";
import type { Enrollment, Paginated } from "./types";

/**
 * PRD: POST /courses/:id/enroll — implemented as `POST courses/{id}/enroll/` under `/api/v1/`.
 */
export function enrollInCourse(courseId: number, body: Record<string, unknown> = {}) {
  return apiRequest<Enrollment>({
    path: `courses/${courseId}/enroll/`,
    method: "POST",
    json: body,
  });
}

export function listMyEnrollments(params?: { limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiRequest<Paginated<Enrollment>>({
    path: q ? `enrollments/?${q}` : "enrollments/",
  });
}
