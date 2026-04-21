import { ROUTES } from "@/constants";
import type { UserRole } from "@/lib/api/types";

const ROLES: UserRole[] = ["admin", "instructor", "student"];

export function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const r = value.toLowerCase();
  return ROLES.includes(r as UserRole) ? (r as UserRole) : null;
}

/** Course editor / studio (admin or instructor). */
export function canAccessContentStudio(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "instructor";
}

export function isStudentRole(role: UserRole | null | undefined): boolean {
  return role === "student";
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

/**
 * Default landing after login. Unknown role → studio (instructors often lack `role` in JWT until `/users/me/` works).
 */
export function postLoginRedirectPath(role: UserRole | null | undefined): string {
  if (role === "student") return ROUTES.LEARN;
  return ROUTES.ADMIN_COURSES;
}
