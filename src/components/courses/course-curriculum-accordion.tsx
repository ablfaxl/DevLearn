"use client";

import { CurriculumContentItem } from "@/components/courses/curriculum-content-item";
import type { ModuleDetail } from "@/lib/api/types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function CourseCurriculumAccordion({
  modules,
  outlineOnly = false,
}: {
  modules: ModuleDetail[];
  /** Public catalog: show structure only — never render bodies or media players. */
  outlineOnly?: boolean;
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(modules.map((m) => m.id)));

  function toggle(id: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--lms-border) bg-(--lms-surface) shadow-xl shadow-black/20 ring-1 ring-black/15">
      {modules.map((mod, mi) => {
        const expanded = open.has(mod.id);
        return (
          <div key={mod.id} className="border-b border-(--lms-border) last:border-b-0">
            <button
              type="button"
              onClick={() => toggle(mod.id)}
              className="group flex w-full items-start gap-3 bg-(--lms-surface) px-4 py-4 text-left transition-colors duration-200 hover:bg-(--lms-surface-elevated)"
              aria-expanded={expanded}
            >
              <span
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--lms-border) bg-black/15 text-(--lms-text-muted) transition duration-300 ${
                  expanded ? "rotate-180 border-(--lms-accent)/45 text-(--lms-accent)" : "group-hover:text-(--lms-text)"
                }`}
              >
                <ChevronDown className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-(--lms-accent)">
                  Section {mi + 1}
                </span>
                <span className="mt-0.5 block text-base font-semibold text-(--lms-text)">
                  {mod.title}
                </span>
                {mod.description ? (
                  <span className="mt-1 block text-sm leading-relaxed text-(--lms-text-muted)">
                    {mod.description}
                  </span>
                ) : null}
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-(--lms-border) bg-(--lms-surface-elevated) px-4 pb-4 pt-2">
                <ol className="space-y-3">
                  {(mod.lessons ?? []).map((lesson, li) => (
                    <li
                      key={lesson.id}
                      className="rounded-xl border border-(--lms-border) bg-(--lms-surface) p-4 shadow-sm shadow-black/20"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black/20 text-xs font-bold text-(--lms-accent) shadow-sm ring-1 ring-(--lms-border)">
                          {li + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-semibold text-(--lms-text)">
                              {lesson.title}
                            </h4>
                            <span className="rounded-md border border-(--lms-border) bg-black/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--lms-text-muted)">
                              {lesson.content_type}
                            </span>
                          </div>
                          <ul className="mt-3 divide-y divide-(--lms-border)">
                            {(lesson.contents ?? []).map((c) => (
                              <li key={c.id} className="py-3 first:pt-0">
                                {outlineOnly ? (
                                  <div className="text-sm text-(--lms-text-muted)">
                                    <span className="font-semibold text-(--lms-text)">
                                      {c.title}
                                    </span>
                                    <span className="ml-2 text-xs font-medium uppercase tracking-wide text-(--lms-text-subtle)">
                                      {c.content_type}
                                    </span>
                                    <p className="mt-1 text-xs text-(--lms-text-subtle)">
                                      Full text and media are in the classroom after you sign in and
                                      enroll.
                                    </p>
                                  </div>
                                ) : (
                                  <CurriculumContentItem
                                    title={c.title}
                                    contentType={c.content_type}
                                    fileUrl={c.file_url}
                                    bodyText={c.content}
                                  />
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
