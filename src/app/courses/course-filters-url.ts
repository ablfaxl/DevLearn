import type { CourseFiltersState, CourseSort } from "./types";

const SORT_VALUES: CourseSort[] = ["relevance", "price-asc", "price-desc", "title-asc"];

function isCourseSort(value: string): value is CourseSort {
  return (SORT_VALUES as readonly string[]).includes(value);
}

function snapToStep(value: number, min: number, max: number, step: number) {
  const clamped = Math.min(max, Math.max(min, value));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  return Math.min(max, Math.max(min, snapped));
}

/**
 * Read filter state from URL search params (`q`, `category`, `maxPrice`, `sort`).
 */
export function parseCourseFiltersFromSearchParams(
  sp: Pick<URLSearchParams, "get">,
  priceBounds: { min: number; max: number },
  validCategories: readonly string[]
): CourseFiltersState {
  const q = sp.get("q")?.trim() ?? "";

  const catRaw = sp.get("category");
  const category = catRaw && validCategories.includes(catRaw) ? catRaw : null;

  const maxRaw = sp.get("maxPrice");
  let maxPrice = priceBounds.max;
  if (maxRaw != null && maxRaw !== "") {
    const n = Number(maxRaw);
    if (Number.isFinite(n)) {
      maxPrice = snapToStep(n, priceBounds.min, priceBounds.max, 5);
    }
  }

  const sortRaw = sp.get("sort");
  const sort: CourseSort = sortRaw && isCourseSort(sortRaw) ? sortRaw : "relevance";

  return {
    query: q,
    category,
    maxPrice,
    sort,
  };
}

/**
 * Build a query string for the current filters. Omits params that match catalog defaults
 * so shareable URLs stay short.
 */
export function serializeCourseFiltersToSearchParams(
  f: CourseFiltersState,
  priceBounds: { min: number; max: number }
): string {
  const sp = new URLSearchParams();
  if (f.query.trim()) sp.set("q", f.query.trim());
  if (f.category) sp.set("category", f.category);
  if (f.maxPrice !== priceBounds.max) sp.set("maxPrice", String(f.maxPrice));
  if (f.sort !== "relevance") sp.set("sort", f.sort);
  return sp.toString();
}
