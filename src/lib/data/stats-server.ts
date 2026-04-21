import { getServerApiV1Base } from "./server-api";

export type PublicStats = {
  courses_count: number;
  learners_count: number;
  instructors_count: number;
};

export async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const res = await fetch(`${getServerApiV1Base()}/stats/`, {
      next: { revalidate: 120 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicStats;
  } catch {
    return null;
  }
}
