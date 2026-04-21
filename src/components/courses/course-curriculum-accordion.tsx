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
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
      {modules.map((mod, mi) => {
        const expanded = open.has(mod.id);
        return (
          <div key={mod.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(mod.id)}
              className="flex w-full items-start gap-3 bg-zinc-50/50 px-4 py-4 text-left transition hover:bg-zinc-100/80 dark:bg-zinc-900/30 dark:hover:bg-zinc-800/50"
              aria-expanded={expanded}
            >
              <span
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition dark:border-zinc-700 dark:bg-zinc-950 ${
                  expanded ? "rotate-180" : ""
                }`}
              >
                <ChevronDown className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-400">
                  Section {mi + 1}
                </span>
                <span className="mt-0.5 block text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {mod.title}
                </span>
                {mod.description ? (
                  <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">{mod.description}</span>
                ) : null}
              </span>
            </button>
            {expanded ? (
              <div className="border-t border-zinc-100 bg-white px-4 pb-4 pt-2 dark:border-zinc-800 dark:bg-zinc-950/40">
                <ol className="space-y-3">
                  {(mod.lessons ?? []).map((lesson, li) => (
                    <li
                      key={lesson.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-fuchsia-700 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-fuchsia-400 dark:ring-zinc-700">
                          {li + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{lesson.title}</h4>
                            <span className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {lesson.content_type}
                            </span>
                          </div>
                          <ul className="mt-3 divide-y divide-zinc-200/80 dark:divide-zinc-800">
                            {(lesson.contents ?? []).map((c) => (
                              <li key={c.id} className="py-3 first:pt-0">
                                {outlineOnly ? (
                                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{c.title}</span>
                                    <span className="ml-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                      {c.content_type}
                                    </span>
                                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                      Full text and media are in the classroom after you sign in and enroll.
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
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
