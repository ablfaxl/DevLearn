import type { Content, CourseDetail, LessonDetail } from "@/lib/api/types";

export function flattenFirstContent(course: CourseDetail): Content | null {
  for (const mod of course.modules ?? []) {
    for (const lesson of mod.lessons ?? []) {
      for (const c of lesson.contents ?? []) {
        return c;
      }
    }
  }
  return null;
}

export function findContent(course: CourseDetail, contentId: number): Content | null {
  for (const mod of course.modules ?? []) {
    for (const lesson of mod.lessons ?? []) {
      for (const c of lesson.contents ?? []) {
        if (c.id === contentId) return c;
      }
    }
  }
  return null;
}

export function findLessonForContent(course: CourseDetail, contentId: number): LessonDetail | null {
  for (const mod of course.modules ?? []) {
    for (const lesson of mod.lessons ?? []) {
      for (const c of lesson.contents ?? []) {
        if (c.id === contentId) return lesson;
      }
    }
  }
  return null;
}

/** One tree walk for selection (avoids duplicate scans from separate lookups). */
export function findContentAndLesson(
  course: CourseDetail,
  contentId: number
): { content: Content; lesson: LessonDetail } | null {
  for (const mod of course.modules ?? []) {
    for (const lesson of mod.lessons ?? []) {
      for (const c of lesson.contents ?? []) {
        if (c.id === contentId) return { content: c, lesson };
      }
    }
  }
  return null;
}
