import { ROUTES } from "@/constants";
import { getPublicCourseDetail } from "@/lib/data/course-detail-server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";

const CourseLearnWorkspace = dynamic(
  () => import("./course-learn-workspace").then((m) => m.CourseLearnWorkspace),
  {
    loading: () => (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div
          className="size-9 animate-spin rounded-full border-2 border-zinc-200 border-t-fuchsia-600 dark:border-zinc-700 dark:border-t-fuchsia-400"
          aria-hidden
        />
        Loading classroom…
      </div>
    ),
  }
);

type PageProps = { params: Promise<{ courseId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const id = Number(courseId);
  const course = Number.isInteger(id) && id >= 1 ? await getPublicCourseDetail(id) : null;
  if (!course) return { title: "Classroom" };
  return { title: `${course.title} · Classroom` };
}

export default async function LearnCoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const id = Number(courseId);
  if (!Number.isInteger(id) || id < 1) notFound();

  const course = await getPublicCourseDetail(id);
  if (!course) notFound();

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-zinc-50 dark:bg-zinc-950">
      <div className="border-b border-zinc-200/80 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <Link href={ROUTES.LEARN} className="text-sm font-medium text-fuchsia-700 hover:underline dark:text-fuchsia-400">
            ← My learning
          </Link>
          <Link href={ROUTES.MESSAGES} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
            Messages
          </Link>
        </div>
      </div>
      <CourseLearnWorkspace key={id} course={course} />
    </div>
  );
}
