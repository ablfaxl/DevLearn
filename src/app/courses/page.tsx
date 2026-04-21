import { Suspense } from "react";
import CoursesCatalog from "./courses-catalog";

function CoursesCatalogFallback() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-100 to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-64 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80" />
            ))}
          </div>
          <div className="h-[28rem] animate-pulse rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 lg:col-start-2" />
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-100 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <Suspense fallback={<CoursesCatalogFallback />}>
        <CoursesCatalog />
      </Suspense>
    </div>
  );
}
