"use client";

import { CurriculumContentItem } from "@/components/courses/curriculum-content-item";
import { ROUTES } from "@/constants";
import { LockedCurriculumMessage } from "@/features/courses/components/locked-curriculum-message";
import { useCourseCurriculumLoader } from "@/features/courses/hooks/use-course-curriculum-loader";
import { findContentAndLesson, flattenFirstContent } from "@/features/courses/lib/course-tree";
import type { Content, CourseDetail, LessonDetail, ModuleDetail } from "@/lib/api/types";
import { Button } from "@heroui/react";
import { BookOpen, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useMemo, useState, startTransition } from "react";

type SidebarProps = {
  modules: ModuleDetail[];
  openModules: Set<number>;
  selectedContentId: number | null;
  onToggleModule: (id: number) => void;
  onSelectContent: (id: number) => void;
};

const LearnCurriculumSidebar = memo(function LearnCurriculumSidebar({
  modules,
  openModules,
  selectedContentId,
  onToggleModule,
  onSelectContent,
}: SidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80 lg:self-start">
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Curriculum</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Modules, lessons, and content blocks. Materials load when your account is allowed.
        </p>
        <nav className="mt-4 max-h-[min(70vh,32rem)] space-y-2 overflow-y-auto overscroll-contain pr-1">
          {modules.map((mod) => {
            const open = openModules.has(mod.id);
            return (
              <div
                key={mod.id}
                className="rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-900/80"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="flex h-auto min-h-11 w-full items-center justify-start gap-2 rounded-xl px-3 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100"
                  onPress={() => onToggleModule(mod.id)}
                >
                  {open ? (
                    <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
                  )}
                  <span className="line-clamp-2 text-sm">{mod.title}</span>
                </Button>
                {open ? (
                  <ul className="space-y-1 border-t border-zinc-100 px-2 py-2 dark:border-zinc-800">
                    {(mod.lessons ?? []).map((lesson) => (
                      <li key={lesson.id}>
                        <p className="px-2 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {lesson.title}
                        </p>
                        <ul className="ml-1 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-700">
                          {(lesson.contents ?? []).map((c: Content) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => onSelectContent(c.id)}
                                className={`w-full rounded-lg px-2 py-1.5 text-left text-xs transition ${
                                  selectedContentId === c.id
                                    ? "bg-fuchsia-100 font-medium text-fuchsia-950 dark:bg-fuchsia-950/50 dark:text-fuchsia-100"
                                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                }`}
                              >
                                <span className="mr-1 opacity-50">{c.content_type}</span>
                                {c.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
});

export function CourseLearnWorkspace({ course: initialCourse }: { course: CourseDetail }) {
  const courseId = initialCourse.id;
  const { course, curriculumLoading, fullCurriculumLoaded, curriculumBlocked } =
    useCourseCurriculumLoader(courseId, initialCourse);

  const [openModules, setOpenModules] = useState<Set<number>>(
    () => new Set((initialCourse.modules ?? []).map((m) => m.id))
  );
  const [selectedContentId, setSelectedContentId] = useState<number | null>(() => {
    const f = flattenFirstContent(initialCourse);
    return f?.id ?? null;
  });

  const selection = useMemo(() => {
    if (selectedContentId == null) {
      return { content: null as Content | null, lesson: null as LessonDetail | null };
    }
    const hit = findContentAndLesson(course, selectedContentId);
    return hit ?? { content: null, lesson: null };
  }, [course, selectedContentId]);

  const { content: selectedContent, lesson: selectedLesson } = selection;

  const toggleModule = useCallback((id: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectContent = useCallback((id: number) => {
    startTransition(() => setSelectedContentId(id));
  }, []);

  const instructor = course.instructor_detail?.username;
  const modules = course.modules ?? [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-10">
      <main className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-400">
              Classroom
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {course.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              {instructor ? (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="size-4" aria-hidden />
                  {instructor}
                </span>
              ) : null}
              {selectedLesson ? (
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="size-4" aria-hidden />
                  {selectedLesson.title}
                </span>
              ) : null}
            </div>
          </div>
          <Link
            href={ROUTES.courseDetail(course.id)}
            className="text-sm font-medium text-fuchsia-700 hover:underline dark:text-fuchsia-400"
          >
            Course overview →
          </Link>
        </div>

        <div className="rounded-2xl border  border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:ring-zinc-800 sm:p-6">
          {curriculumLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-zinc-500 dark:text-zinc-400">
              <div
                className="size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-fuchsia-600 dark:border-zinc-700 dark:border-t-fuchsia-400"
                aria-hidden
              />
              Loading lesson materials…
            </div>
          ) : selectedContent && fullCurriculumLoaded ? (
            <CurriculumContentItem
              title={selectedContent.title}
              contentType={selectedContent.content_type}
              fileUrl={selectedContent.file_url}
              bodyText={selectedContent.content}
            />
          ) : selectedContent && curriculumBlocked ? (
            <div className="space-y-4">
              <LockedCurriculumMessage reason={curriculumBlocked} courseId={courseId} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Selected:{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {selectedContent.title}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No lesson content published yet. Check back later.
            </p>
          )}
        </div>
      </main>

      <LearnCurriculumSidebar
        modules={modules}
        openModules={openModules}
        selectedContentId={selectedContentId}
        onToggleModule={toggleModule}
        onSelectContent={selectContent}
      />
    </div>
  );
}
