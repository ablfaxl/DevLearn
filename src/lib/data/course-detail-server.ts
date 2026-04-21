import type { CourseDetail } from "@/lib/api/types";
import { redactCourseDetailForPublic } from "./redact-public-course";
import { getServerApiV1Base } from "./server-api";

/** Server-side course payload for marketing + layout (no lesson bodies or media URLs). */
export async function getPublicCourseDetail(id: number): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${getServerApiV1Base()}/courses/${id}/`, {
      next: { revalidate: 120 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as CourseDetail;
    return redactCourseDetailForPublic(raw);
  } catch {
    return null;
  }
}
