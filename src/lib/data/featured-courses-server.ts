import { getServerApiV1Base } from "./server-api";

export type FeaturedCoursePreview = {
  id: number;
  title: string;
  description: string;
  slug?: string;
  thumbnail_url?: string | null;
  price?: string | number;
  category?: string | null;
};

export async function getFeaturedCoursesPreview(): Promise<FeaturedCoursePreview[] | null> {
  try {
    const res = await fetch(`${getServerApiV1Base()}/courses/?limit=6`, {
      next: { revalidate: 120 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: FeaturedCoursePreview[];
    };
    if (!data.results?.length) return null;
    return data.results.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description?.slice(0, 180) ?? "",
      slug: r.slug,
      thumbnail_url: r.thumbnail_url,
      price: r.price,
      category: r.category,
    }));
  } catch {
    return null;
  }
}
