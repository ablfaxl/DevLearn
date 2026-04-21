/** Matches Django `CustomUser.role` */
export type UserRole = "admin" | "instructor" | "student";

export interface UserBrief {
  id: number;
  username: string;
  /** Omitted on unauthenticated public responses. */
  email?: string;
  role: UserRole;
}

/** Role-level flags from `GET /api/v1/me/` (`access`); per-course rules still apply in each API. */
export interface CurrentUserAccess {
  can_manage_users: boolean;
  can_write_courses: boolean;
  can_use_mine_courses_query: boolean;
  can_enroll_in_courses: boolean;
  can_write_learning_content: boolean;
  can_view_grade_rosters: boolean;
  can_access_django_admin: boolean;
}

/** Current user from `GET …/me/` (default; override with `NEXT_PUBLIC_API_ME_PATH`). */
export interface UserProfile extends UserBrief {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  /** Single display field some serializers use */
  name?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  access?: CurrentUserAccess;
}

/** Row from `GET /courses/{id}/students/` (CourseStudentSerializer). */
export interface CourseStudentRow {
  user: number | UserBrief;
  enrolled_at?: string;
}

export type LessonContentType = "text" | "video" | "audio" | "document";

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: number;
  instructor_detail?: UserBrief;
  created_at: string;
  updated_at: string;
  /** URL path segment; unique, auto from title if blank on create. */
  slug?: string;
  thumbnail?: string | null;
  /** Absolute URL when a thumbnail exists (read-only). */
  thumbnail_url?: string | null;
  category?: string | null;
  /** Django `Decimal`; often serialized as string in JSON. */
  price?: string | number;
}

export interface Module {
  id: number;
  course: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  module: number;
  title: string;
  content_type: LessonContentType;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  lesson: number;
  title: string;
  content_type: LessonContentType;
  content: string;
  file: string | null;
  file_url: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonDetail extends Lesson {
  contents: Content[];
}

export interface ModuleDetail extends Module {
  lessons: LessonDetail[];
}

export interface CourseDetail extends Course {
  modules: ModuleDetail[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** `GET /api/v1/admin/overview/` — counts + recent activity (shape varies by backend). */
export interface AdminOverviewResponse {
  counts: Record<string, number>;
  /** Named lists from the API, e.g. `users`, `enrollments`, `courses`. */
  recent: Record<string, Record<string, unknown>[]>;
}

/** Writable course fields for POST/PATCH (admin may include instructor). */
export interface CourseWritePayload {
  title: string;
  description: string;
  instructor?: number;
}

export interface ModuleWritePayload {
  course: number;
  title: string;
  description: string;
}

export interface LessonWritePayload {
  module: number;
  title: string;
  content_type: LessonContentType;
}

export interface ContentWritePayload {
  lesson: number;
  title: string;
  content_type: LessonContentType;
  content?: string;
  order?: number;
}

export type FieldErrors = Record<string, string[]>;

/** PRD: Enrollment (student ↔ course). */
export interface Enrollment {
  id: number;
  user: number;
  course: number;
  enrolled_at: string;
  /** 0–100 when backend provides it */
  progress_percent?: number | null;
}

/** PRD: Grade per student/course (instructor writes). */
export interface Grade {
  id: number;
  enrollment: number;
  course: number;
  user: number;
  score: string | number;
  feedback?: string | null;
  created_at?: string;
  updated_at: string;
}

/** PRD: Direct messaging between users (optionally scoped to a course). */
export interface Message {
  id: number;
  sender: number;
  recipient: number;
  course?: number | null;
  body: string;
  read?: boolean;
  created_at: string;
}

export interface MessageSendPayload {
  recipient: number;
  body: string;
  course?: number;
}

/** Optional `GET /api/v1/notifications/` (path overridable via `NEXT_PUBLIC_API_NOTIFICATIONS_PATH`). */
export interface UserNotification {
  id: number;
  title: string;
  body?: string;
  read?: boolean;
  created_at: string;
  link?: string | null;
  type?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  /** When API supports explicit role at signup. */
  role?: "student" | "instructor";
}
