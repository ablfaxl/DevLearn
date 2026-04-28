import { Suspense } from "react";
import CoursesCatalog from "./courses-catalog";
import { getPublicCoursesServer } from "@/lib/data/public-courses-server";

function CoursesCatalogFallback() {
  return (
    <div className="min-h-screen bg-linear-to-b from-(--lms-bg) via-(--lms-bg) to-black/90">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-(--lms-surface-elevated)" />
          <div className="h-4 w-64 animate-pulse rounded bg-(--lms-surface)" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-(--lms-border) bg-(--lms-surface)"
              />
            ))}
          </div>
          <div className="h-112 animate-pulse rounded-2xl border border-(--lms-border) bg-(--lms-surface) lg:col-start-2" />
        </div>
      </div>
    </div>
  );
}

export default async function CoursesPage() {
  const initialCourses = await getPublicCoursesServer(200);

  return (
    <div className="min-h-screen bg-linear-to-b from-(--lms-bg) via-(--lms-bg) to-black/90">
      <Suspense fallback={<CoursesCatalogFallback />}>
        <CoursesCatalog initialCourses={initialCourses} />
      </Suspense>
    </div>
  );
}
