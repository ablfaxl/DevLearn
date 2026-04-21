import type { Content, CourseDetail, LessonDetail, ModuleDetail } from "@/lib/api/types";

/** Extra serializer keys that sometimes carry bodies or media URLs outside `content` / `file_url`. */
const LEAKY_CONTENT_KEYS = [
  "body",
  "html",
  "text",
  "markdown",
  "video_url",
  "audio_url",
  "embed_url",
  "signed_url",
  "download_url",
  "file_uri",
  "src",
  "url",
] as const;

function redactContent(c: Content): Content {
  const row = { ...(c as Content & Record<string, unknown>) };
  for (const k of LEAKY_CONTENT_KEYS) {
    if (k in row) delete row[k];
  }
  return { ...(row as Content), content: "", file: null, file_url: null };
}

function redactLesson(l: LessonDetail): LessonDetail {
  return {
    ...l,
    contents: (l.contents ?? []).map(redactContent),
  };
}

function redactModule(m: ModuleDetail): ModuleDetail {
  return {
    ...m,
    lessons: (m.lessons ?? []).map(redactLesson),
  };
}

/**
 * Strips lesson bodies and media URLs so anonymous catalog/SSR pages cannot leak learning materials.
 * Structure (module / lesson / content titles and types) stays for navigation and SEO.
 */
export function redactCourseDetailForPublic(course: CourseDetail): CourseDetail {
  return {
    ...course,
    modules: (course.modules ?? []).map(redactModule),
  };
}
