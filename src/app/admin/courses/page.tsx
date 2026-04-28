"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { ApiError } from "@/lib/api/client";
import { listCourses } from "@/lib/api/courses";
import type { Course } from "@/lib/api/types";
import { coursesListMineParam } from "@/lib/auth/access";
import { canAccessContentStudio, isAdminRole } from "@/lib/auth/roles";
import { Button } from "@heroui/react";
import { BookOpen, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function AdminCoursesPage() {
  const router = useRouter();
  const { profile, role } = useAdminAuth();
  const [rows, setRows] = useState<Course[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mine = useMemo(() => coursesListMineParam(profile?.access), [profile?.access]);
  const isPlatformAdmin = profile?.access ? profile.access.can_manage_users : isAdminRole(role);
  const canNewCourse = profile?.access?.can_write_courses ?? canAccessContentStudio(role);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await listCourses({ limit, offset, mine });
      setRows(res.results);
      setCount(res.count);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [limit, offset, mine]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--lms-accent)">
            Overview
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-(--lms-text)">Courses</h1>
          <p className="mt-2 max-w-xl text-sm text-(--lms-text-muted)">
            {isPlatformAdmin
              ? "As admin: every course on the server, assign instructors, and open any editor. Students never see this list unless they are also staff."
              : "As instructor: courses you teach. Edit modules and lessons; your students use My learning. If you see a permission error, that action is limited to admins."}
          </p>
        </div>
        {canNewCourse ? (
          <Button
            onPress={() => router.push(ROUTES.ADMIN_COURSES_NEW)}
            className="h-11 shrink-0 gap-2 bg-(--lms-accent) font-semibold text-(--lms-text) hover:bg-(--lms-accent)/50"
          >
            <Plus className="size-4" aria-hidden />
            New course
          </Button>
        ) : null}
      </div>
      {/*  stats cards */}
      {error ? (
        <div className="rounded-xl border border-(--lms-danger) bg-(--lms-danger-foreground) px-4 py-3 text-sm text-(--lms-danger-foreground)">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-(--lms-border)/80 bg-white shadow-sm ring-1 ring-(--lms-border)/5">
        <div className="flex items-center gap-2 border-b border-(--lms-border)/80 bg-(--lms-surface)/80 px-4 py-3">
          <BookOpen className="size-4 text-(--lms-text-muted)" aria-hidden />
          <span className="text-sm font-semibold text-(--lms-text)">
            {isPlatformAdmin ? "All courses" : "Courses"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-(--lms-border)/80 text-sm">
            <thead className="bg-(--lms-surface) text-left text-xs font-semibold uppercase tracking-wide text-(--lms-text-muted)">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 md:table-cell">Instructor</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--lms-border)/80 bg-(--lms-surface)">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-4">
                        <div className="h-4 max-w-md w-[70%] animate-pulse rounded bg-(--lms-surface)/80" />
                      </td>
                    </tr>
                  ))
                : rows.map((c) => (
                    <tr key={c.id} className="transition hover:bg-(--lms-surface-elevated)">
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-(--lms-text)">{c.title}</span>
                      </td>
                      <td className="hidden px-4 py-3.5 text-(--lms-text-muted) md:table-cell">
                        {c.instructor_detail?.username ?? `User #${c.instructor}`}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-(--lms-text-muted)">
                        {new Date(c.updated_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-(--lms-border)/80 font-medium"
                          onPress={() => router.push(ROUTES.adminCourse(c.id))}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <p className="text-(--lms-text-muted)">No courses yet.</p>
                    {canNewCourse ? (
                      <Button
                        className="mt-4"
                        onPress={() => router.push(ROUTES.ADMIN_COURSES_NEW)}
                      >
                        Create your first course
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {count > limit ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-(--lms-border)/80 bg-(--lms-surface)/80 px-4 py-3 text-sm text-(--lms-text-muted)">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-(--lms-border)/80"
            isDisabled={offset === 0 || loading}
            onPress={() => setOffset((o) => Math.max(0, o - limit))}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </Button>
          <span className="tabular-nums">
            {offset + 1}–{Math.min(offset + limit, count)} of {count}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-(--lms-border)/80"
            isDisabled={offset + limit >= count || loading}
            onPress={() => setOffset((o) => o + limit)}
          >
            Next
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
