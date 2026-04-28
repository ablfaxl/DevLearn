"use client";

import { CurriculumContentItem } from "@/components/courses/curriculum-content-item";
import { ROUTES } from "@/constants";
import { LockedCurriculumMessage } from "@/features/courses/components/locked-curriculum-message";
import { useCourseCurriculumLoader } from "@/features/courses/hooks/use-course-curriculum-loader";
import { findContentAndLesson, flattenFirstContent } from "@/features/courses/lib/course-tree";
import type { Content, CourseDetail, LessonDetail, ModuleDetail } from "@/lib/api/types";
import { Button } from "@heroui/react";
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
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
      <div className="rounded-2xl border border-(--lms-border) bg-(--lms-surface) p-4 shadow-sm ring-1 ring-black/15">
        <h2 className="text-sm font-semibold text-(--lms-text)">Curriculum</h2>
        <p className="mt-1 text-xs text-(--lms-text-muted)">
          Modules, lessons, and content blocks. Materials load when your account is allowed.
        </p>
        <nav className="mt-4 max-h-[min(70vh,32rem)] space-y-2 overflow-y-auto overscroll-contain pr-1">
          {modules.map((mod) => {
            const open = openModules.has(mod.id);
            return (
              <div
                key={mod.id}
                className="rounded-xl border border-(--lms-border) bg-(--lms-surface-elevated)"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="flex h-auto min-h-11 w-full items-center justify-start gap-2 rounded-xl px-3 py-2 text-left font-semibold text-(--lms-text)"
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
                  <ul className="space-y-1 border-t border-(--lms-border) px-2 py-2">
                    {(mod.lessons ?? []).map((lesson) => (
                      <li key={lesson.id}>
                        <p className="px-2 py-1 text-xs font-medium text-(--lms-text-muted)">
                          {lesson.title}
                        </p>
                        <ul className="ml-1 space-y-0.5 border-l border-(--lms-border) pl-2">
                          {(lesson.contents ?? []).map((c: Content) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => onSelectContent(c.id)}
                                className={`w-full rounded-lg px-2 py-1.5 text-left text-xs transition ${
                                  selectedContentId === c.id
                                    ? "bg-(--lms-accent)/20 font-medium text-(--lms-accent)"
                                    : "text-(--lms-text-muted) hover:bg-white/6 hover:text-(--lms-text)"
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
  const modules = useMemo(() => course.modules ?? [], [course.modules]);
  const contentSequence = useMemo(() => {
    const seq: Content[] = [];
    for (const mod of modules) {
      for (const lesson of mod.lessons ?? []) {
        const sorted = [...(lesson.contents ?? [])].sort((a, b) => a.order - b.order || a.id - b.id);
        seq.push(...sorted);
      }
    }
    return seq;
  }, [modules]);
  const selectedIndex = useMemo(() => {
    if (selectedContentId == null) return -1;
    return contentSequence.findIndex((c) => c.id === selectedContentId);
  }, [contentSequence, selectedContentId]);
  const prevContentId = selectedIndex > 0 ? contentSequence[selectedIndex - 1]?.id ?? null : null;
  const nextContentId =
    selectedIndex >= 0 && selectedIndex < contentSequence.length - 1
      ? contentSequence[selectedIndex + 1]?.id ?? null
      : null;
  const hardBlocked =
    !fullCurriculumLoaded &&
    (curriculumBlocked === "no_token" ||
      curriculumBlocked === "not_enrolled" ||
      curriculumBlocked === "forbidden");

  if (hardBlocked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-(--lms-border) bg-(--lms-surface) p-6 shadow-sm ring-1 ring-black/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--lms-accent)">Classroom locked</p>
          <h1 className="mt-2 text-2xl font-bold text-(--lms-text)">{course.title}</h1>
          <p className="mt-2 text-sm text-(--lms-text-muted)">
            You need full access to open lesson content in this classroom.
          </p>
          <div className="mt-5">
            <LockedCurriculumMessage reason={curriculumBlocked} courseId={courseId} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={ROUTES.courseDetail(course.id)}
              className="inline-flex items-center rounded-xl bg-(--lms-accent) px-4 py-2.5 text-sm font-semibold text-[#1a0f08] transition hover:brightness-110"
            >
              Go to course page
            </Link>
            <Link
              href={ROUTES.COURSES}
              className="inline-flex items-center rounded-xl border border-(--lms-border) bg-(--lms-surface-elevated) px-4 py-2.5 text-sm font-medium text-(--lms-text)"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-10">
      <main className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--lms-accent)">
              Classroom
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--lms-text)">
              {course.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-(--lms-text-muted)">
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
            className="text-sm font-medium text-(--lms-accent) hover:underline"
          >
            Course overview →
          </Link>
        </div>

        <div className="rounded-2xl border border-(--lms-border) bg-(--lms-surface) p-4 shadow-sm ring-1 ring-black/20 sm:p-6">
          {curriculumLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-(--lms-text-muted)">
              <div
                className="size-8 animate-spin rounded-full border-2 border-(--lms-border) border-t-(--lms-accent)"
                aria-hidden
              />
              Loading lesson materials…
            </div>
          ) : selectedContent && fullCurriculumLoaded ? (
            <div className="space-y-4">
              <CurriculumContentItem
                title={selectedContent.title}
                contentType={selectedContent.content_type}
                fileUrl={selectedContent.file_url}
                bodyText={selectedContent.content}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--lms-border) pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 rounded-xl border border-(--lms-border) bg-(--lms-surface-elevated) px-4 text-(--lms-text) disabled:opacity-45"
                  isDisabled={!prevContentId}
                  onPress={() => {
                    if (prevContentId) selectContent(prevContentId);
                  }}
                >
                  <ArrowLeft className="mr-1 size-4" aria-hidden />
                  Previous lesson
                </Button>

                <p className="text-xs text-(--lms-text-muted)">
                  {selectedIndex >= 0 ? selectedIndex + 1 : 0} / {contentSequence.length}
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 rounded-xl border border-(--lms-border) bg-(--lms-surface-elevated) px-4 text-(--lms-text) disabled:opacity-45"
                  isDisabled={!nextContentId}
                  onPress={() => {
                    if (nextContentId) selectContent(nextContentId);
                  }}
                >
                  Next lesson
                  <ArrowRight className="ml-1 size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ) : selectedContent && curriculumBlocked ? (
            <div className="space-y-4">
              <LockedCurriculumMessage reason={curriculumBlocked} courseId={courseId} />
              <p className="text-xs text-(--lms-text-muted)">
                Selected:{" "}
                <span className="font-medium text-(--lms-text)">{selectedContent.title}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-(--lms-text-muted)">
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
