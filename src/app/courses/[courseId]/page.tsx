import { CourseCurriculumAccordion } from "@/components/courses/course-curriculum-accordion";
import { CourseEnrollPanel } from "@/components/courses/course-enroll-panel";
import { ROUTES } from "@/constants";
import { getPublicCourseDetail } from "@/lib/data/course-detail-server";
import { parseCoursePrice } from "@/lib/utils/price";
import { BookOpen, ChevronRight, Clock, GraduationCap, Play, Star, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const FALLBACK_HERO_IMAGE = "/img/placeholder.png";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const id = Number(courseId);
  const course = Number.isInteger(id) && id >= 1 ? await getPublicCourseDetail(id) : null;
  if (!course) {
    return { title: "Course not found" };
  }
  const desc = course.description?.slice(0, 160) ?? "";
  const ogImage = course.thumbnail_url ?? undefined;
  return {
    title: `${course.title} · Courses`,
    description: desc,
    openGraph: {
      title: course.title,
      description: desc,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const id = Number(courseId);
  if (!Number.isInteger(id) || id < 1) notFound();

  const course = await getPublicCourseDetail(id);
  if (!course) notFound();

  const heroSrc = course.thumbnail_url ?? FALLBACK_HERO_IMAGE;
  const price = parseCoursePrice(course.price);
  const category = course.category?.trim();
  const instructor = course.instructor_detail?.username;
  const moduleCount = course.modules?.length ?? 0;
  const lessonCount = course.modules?.reduce((n, m) => n + (m.lessons?.length ?? 0), 0) ?? 0;
  const contentBlocks =
    course.modules?.reduce(
      (n, m) => n + (m.lessons ?? []).reduce((a, l) => a + (l.contents?.length ?? 0), 0),
      0
    ) ?? 0;

  const aboutSnippet =
    course.description?.slice(0, 220) +
    (course.description && course.description.length > 220 ? "…" : "");

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] md:pb-10">
      <div className="relative mx-auto max-w-7xl">
        <div className="relative aspect-[4/3] max-h-[min(42vh,440px)] min-h-[200px] w-full overflow-hidden md:aspect-[21/9] md:max-h-[min(52vh,520px)] md:min-h-[220px] md:rounded-b-3xl">
          <Image src={heroSrc} alt="" fill priority className="object-cover" sizes="100vw" />
          <div
            className="absolute inset-0 bg-linear-to-t from-[var(--lms-bg)] via-[var(--lms-bg)]/55 to-black/20"
            aria-hidden
          />
          <Link
            href="#course-enroll"
            className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#1a0f08] shadow-xl ring-4 ring-black/30 transition hover:scale-105 hover:bg-white"
            aria-label="Enroll to unlock classroom"
          >
            <Play className="ms-0.5 size-7 fill-current" aria-hidden />
          </Link>
        </div>

        <div className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-[var(--lms-surface)] p-6 shadow-2xl shadow-black/40 md:-mt-14 md:p-8">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs text-zinc-500">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href={ROUTES.HOME} className="hover:text-[var(--lms-accent)]">
                    Home
                  </Link>
                </li>
                <ChevronRight className="mx-0.5 inline size-3 opacity-50" aria-hidden />
                <li>
                  <Link href={ROUTES.COURSES} className="hover:text-[var(--lms-accent)]">
                    Courses
                  </Link>
                </li>
                <ChevronRight className="mx-0.5 inline size-3 opacity-50" aria-hidden />
                <li className="line-clamp-1 font-medium text-zinc-300">{course.title}</li>
              </ol>
            </nav>
            {category ? (
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--lms-accent)]">
                {category}
              </p>
            ) : null}
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-3xl">
              {course.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-[var(--lms-accent)]" aria-hidden />
                Open catalog
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-[var(--lms-accent)]" aria-hidden />
                {moduleCount} modules · {lessonCount} lessons
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star
                  className="size-4 fill-[var(--lms-accent)] text-[var(--lms-accent)]"
                  aria-hidden
                />
                4.8
              </span>
            </div>
            {instructor ? (
              <p className="mt-2 text-sm text-zinc-500">
                <GraduationCap className="me-1 inline size-4 text-zinc-500" aria-hidden />
                {instructor}
              </p>
            ) : null}
            <section className="mt-5 border-t border-white/[0.06] pt-5">
              <h2 className="text-sm font-bold text-white">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{aboutSnippet}</p>
              {course.description && course.description.length > 220 ? (
                <p className="mt-1 text-sm font-medium text-[var(--lms-accent)]">more…</p>
              ) : null}
            </section>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
          <article className="min-w-0 space-y-10">
            <Link
              href={ROUTES.COURSES}
              className="inline-flex text-sm font-medium text-[var(--lms-accent)] hover:underline"
            >
              Courses
            </Link>

            <section>
              <h2 className="text-xl font-bold text-white">Full description</h2>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-400">
                {course.description}
              </p>
            </section>

            <section aria-labelledby="curriculum-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="curriculum-heading" className="text-xl font-bold text-white">
                    Lessons
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {String(moduleCount).padStart(2, "0")} modules · outline for visitors
                  </p>
                </div>
                <Link
                  href="#course-enroll"
                  className="inline-flex items-center rounded-full bg-(--lms-accent) px-4 py-2 text-sm font-semibold text-(--lms-text) shadow-md transition hover:brightness-110"
                >
                  Enroll to unlock classroom
                </Link>
              </div>
              <p className="mb-4 rounded-2xl border border-amber-900/40 bg-amber-950/25 px-4 py-3 text-sm leading-relaxed text-amber-100/90">
                This page shows the <strong>outline only</strong> (sections, lessons, and content
                titles). Lesson text, media, and files are not shown here. Sign in and enroll to
                open materials in the classroom.
              </p>
              {!course.modules?.length ? (
                <p className="rounded-2xl border border-dashed border-white/[0.1] bg-[var(--lms-surface)] px-6 py-12 text-center text-sm text-zinc-500">
                  Curriculum will appear here when the instructor publishes modules and lessons.
                </p>
              ) : (
                <CourseCurriculumAccordion modules={course.modules} outlineOnly />
              )}
            </section>
          </article>

          <aside id="course-enroll" className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--lms-surface)] shadow-xl shadow-black/30">
              <div className="border-b border-white/[0.06] bg-linear-to-br from-[var(--lms-accent)]/15 to-transparent px-6 py-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--lms-accent)]">
                  Full course access
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-white">
                  {formatPrice(price)}
                </p>
              </div>
              <div className="px-6 pb-6 pt-2">
                <CourseEnrollPanel courseId={course.id} />
              </div>
              <div className="border-t border-white/[0.06] bg-black/20 px-6 py-4 text-xs text-zinc-500">
                {contentBlocks > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-zinc-500" aria-hidden />
                    {contentBlocks} learning items after enroll
                  </span>
                ) : (
                  "Policies and billing copy can go here."
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-white/[0.08] bg-[#0d0d0d]/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden">
        <Link
          href={ROUTES.COURSES}
          className="flex flex-1 items-center justify-center rounded-2xl border-2 border-[var(--lms-accent)] bg-transparent py-3.5 text-sm font-bold text-[var(--lms-accent)]"
        >
          Courses
        </Link>
        <Link
          href="#course-enroll"
          className="flex flex-[1.35] items-center justify-center rounded-2xl bg-[var(--lms-accent)] py-3.5 text-sm font-bold text-[#1a0f08]"
        >
          Enroll · {formatPrice(price)}
        </Link>
      </div>
    </div>
  );
}
