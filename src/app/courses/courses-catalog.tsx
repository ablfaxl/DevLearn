"use client";

import { ROUTES } from "@/constants";
import { errMessage } from "@/lib/api/client";
import { listPublicCourses } from "@/lib/api/courses";
import type { Course } from "@/lib/api/types";
import { parseCoursePrice } from "@/lib/utils/price";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import CourseCard from "./components/course-card";
import CourseFilter from "./components/course-filter";
import {
  parseCourseFiltersFromSearchParams,
  serializeCourseFiltersToSearchParams,
} from "./course-filters-url";
import type { CourseFiltersState, CourseSort } from "./types";

const FALLBACK_CARD_IMAGE = "/img/docker_thumnail.webp";

function catalogCategories(courses: Course[]): string[] {
  const set = new Set<string>();
  for (const c of courses) {
    const cat = c.category?.trim();
    if (cat) set.add(cat);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function catalogPriceBounds(courses: Course[]): { min: number; max: number } {
  if (!courses.length) return { min: 0, max: 100 };
  const prices = courses.map((c) => parseCoursePrice(c.price));
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  if (maxP <= minP) {
    return { min: 0, max: Math.max(maxP + 5, 100) };
  }
  return { min: minP, max: maxP };
}

function matchesQuery(course: Course, query: string) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const cat = (course.category ?? "").toLowerCase();
  return (
    course.title.toLowerCase().includes(q) ||
    course.description.toLowerCase().includes(q) ||
    cat.includes(q)
  );
}

function sortCourses(list: Course[], sort: CourseSort, query: string): Course[] {
  const next = [...list];
  const price = (c: Course) => parseCoursePrice(c.price);
  if (sort === "price-asc") next.sort((a, b) => price(a) - price(b));
  else if (sort === "price-desc") next.sort((a, b) => price(b) - price(a));
  else if (sort === "title-asc") next.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "relevance" && query.trim()) {
    const q = query.trim().toLowerCase();
    const score = (c: Course) => {
      let s = 0;
      if (c.title.toLowerCase().startsWith(q)) s += 4;
      if (c.title.toLowerCase().includes(q)) s += 2;
      if ((c.category ?? "").toLowerCase().includes(q)) s += 1;
      if (c.description.toLowerCase().includes(q)) s += 1;
      return s;
    };
    next.sort((a, b) => score(b) - score(a));
  }
  return next;
}

export default function CoursesCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listPublicCourses({ limit: 200 });
        if (!cancelled) setCourses(data.results ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(errMessage(e));
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const priceBounds = useMemo(() => catalogPriceBounds(courses), [courses]);
  const categories = useMemo(() => catalogCategories(courses), [courses]);

  const filters = useMemo(
    () => parseCourseFiltersFromSearchParams(searchParams, priceBounds, categories),
    [searchParams, priceBounds, categories]
  );

  const commitFilters = useCallback(
    (next: CourseFiltersState) => {
      const qs = serializeCourseFiltersToSearchParams(next, priceBounds);
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url);
    },
    [pathname, router, priceBounds]
  );

  const filtered = useMemo(() => {
    const list = courses.filter((course) => {
      const cat = course.category?.trim() ?? "";
      if (filters.category && cat !== filters.category) return false;
      if (parseCoursePrice(course.price) > filters.maxPrice) return false;
      if (!matchesQuery(course, filters.query)) return false;
      return true;
    });
    return sortCourses(list, filters.sort, filters.query);
  }, [courses, filters]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-10 lg:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-400">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Explore every course
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          {loading ? (
            "Loading catalog…"
          ) : error ? (
            <span className="text-red-700 dark:text-red-400">{error}</span>
          ) : (
            <>
              Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{filtered.length}</span> of{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{courses.length}</span> courses
            </>
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <main className="min-w-0 lg:col-start-1 lg:row-start-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[22rem] animate-pulse rounded-2xl border border-zinc-200/80 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/60"
                  aria-hidden
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-6 py-16 text-center dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">Could not load courses</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Check that the API is running and{" "}
                <code className="rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_API_*</code>{" "}
                matches your setup.
              </p>
            </div>
          ) : !courses.length ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No courses published yet</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Add courses in the admin when you are ready.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No courses match your filters</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Try clearing search, choosing &quot;All topics&quot;, or raising the price limit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  image={course.thumbnail_url ?? FALLBACK_CARD_IMAGE}
                  title={course.title}
                  description={course.description}
                  price={parseCoursePrice(course.price)}
                  link={ROUTES.courseDetail(course.id)}
                  category={course.category?.trim() || undefined}
                />
              ))}
            </div>
          )}
        </main>

        <aside className="w-full min-w-0 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:z-10 lg:self-start">
          <nav
            aria-label="Course filters"
            className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-zinc-800 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:overscroll-contain"
          >
            <CourseFilter
              filters={filters}
              onFiltersChange={commitFilters}
              categories={categories}
              priceBounds={priceBounds}
              onReset={() => router.replace(pathname)}
              disabled={loading || !!error || !courses.length}
            />
          </nav>
        </aside>
      </div>
    </div>
  );
}
