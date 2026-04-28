import type { Course, Paginated } from "@/lib/api/types";
import { getServerApiV1Base } from "@/lib/data/server-api";

export async function getPublicCoursesServer(limit = 200): Promise<Course[] | null> {
  try {
    const res = await fetch(`${getServerApiV1Base()}/courses/?limit=${limit}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 90 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Paginated<Course>;
    return data.results ?? [];
  } catch {
    return null;
  }
}
