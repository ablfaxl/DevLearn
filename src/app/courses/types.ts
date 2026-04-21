export type CourseSort = "relevance" | "price-asc" | "price-desc" | "title-asc";

export interface CourseFiltersState {
  query: string;
  category: string | null;
  maxPrice: number;
  sort: CourseSort;
}
