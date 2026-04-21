import type { Enrollment, UserProfile } from "@/lib/api/types";

export function isEnrolledInCourse(enrollments: Enrollment[], courseId: number): boolean {
  return enrollments.some((e) => e.course === courseId);
}

/** Staff who may load full curriculum without a student enrollment row (backend still enforces per-course). */
export function hasStaffCurriculumAccess(profile: UserProfile | null): boolean {
  if (!profile) return false;
  const a = profile.access;
  if (a?.can_manage_users === true) return true;
  if (a?.can_write_learning_content === true) return true;
  if (profile.role === "admin") return true;
  return false;
}

export function canLoadFullCurriculum(
  profile: UserProfile | null,
  courseId: number,
  enrollments: Enrollment[]
): boolean {
  return isEnrolledInCourse(enrollments, courseId) || hasStaffCurriculumAccess(profile);
}
