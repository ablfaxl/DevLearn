import { apiRequest, publicApiRequest } from "./client";
import type {
  Course,
  CourseDetail,
  CourseStudentRow,
  CourseWritePayload,
  Enrollment,
  Paginated,
} from "./types";

const base = "courses/";

/** Anonymous list (homepage, catalog). */
export function listPublicCourses(params?: { limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return publicApiRequest<Paginated<Course>>(q ? `${base}?${q}` : base);
}

export function listCourses(params?: { limit?: number; offset?: number; mine?: boolean }) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  if (params?.mine) sp.set("mine", "1");
  const q = sp.toString();
  return apiRequest<Paginated<Course>>({ path: q ? `${base}?${q}` : base });
}

export function getCourse(id: number) {
  return apiRequest<CourseDetail>({ path: `${base}${id}/` });
}

/** Curriculum tree when enrolled or staff (`GET courses/{id}/curriculum/`). */
export function getCourseCurriculum(courseId: number) {
  return apiRequest<CourseDetail>({ path: `${base}${courseId}/curriculum/` });
}

/** Enrolled students / user list for instructor or admin (`GET courses/{id}/students/`). */
export function listCourseStudents(
  courseId: number,
  params?: { limit?: number; offset?: number }
) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiRequest<Paginated<CourseStudentRow>>({
    path: q ? `${base}${courseId}/students/?${q}` : `${base}${courseId}/students/`,
  });
}

/** Course-scoped enrollments list for instructor or admin (`GET courses/{id}/enrollments/`). */
export function listCourseEnrollments(
  courseId: number,
  params?: { limit?: number; offset?: number }
) {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiRequest<Paginated<Enrollment>>({
    path: q ? `${base}${courseId}/enrollments/?${q}` : `${base}${courseId}/enrollments/`,
  });
}

export function createCourse(body: CourseWritePayload) {
  return apiRequest<Course>({ path: base, method: "POST", json: body });
}

export function updateCourse(
  id: number,
  body: Partial<CourseWritePayload>,
  method: "PUT" | "PATCH" = "PATCH"
) {
  return apiRequest<Course>({ path: `${base}${id}/`, method, json: body });
}

export function deleteCourse(id: number) {
  return apiRequest<void>({ path: `${base}${id}/`, method: "DELETE" });
}
