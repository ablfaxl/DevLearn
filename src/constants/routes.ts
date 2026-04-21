/**
 * Central route strings — use instead of scattering literals (DRY, easier refactors).
 */
export const ROUTES = {
  HOME: "/",
  COURSES: "/courses",
  courseDetail: (id: number | string) => `/courses/${id}`,
  LEARN: "/learn",
  learnCourse: (id: number | string) => `/learn/courses/${id}`,
  ADMIN_LOGIN: "/admin/login",
  ADMIN_OVERVIEW: "/admin/overview",
  ADMIN_COURSES: "/admin/courses",
  adminCourse: (id: number | string) => `/admin/courses/${id}`,
  ADMIN_COURSES_NEW: "/admin/courses/new",
  REGISTER: "/register",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
  STUDIO: "/studio",
} as const;
