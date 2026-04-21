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
          <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">Overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">Courses</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            {isPlatformAdmin
              ? "As admin: every course on the server, assign instructors, and open any editor. Students never see this list unless they are also staff."
              : "As instructor: courses you teach. Edit modules and lessons; your students use My learning. If you see a permission error, that action is limited to admins."}
          </p>
        </div>
        {canNewCourse ? (
          <Button
            onPress={() => router.push(ROUTES.ADMIN_COURSES_NEW)}
            className="h-11 shrink-0 gap-2 bg-fuchsia-600 font-semibold text-white hover:bg-fuchsia-500"
          >
            <Plus className="size-4" aria-hidden />
            New course
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200/80 bg-linear-to-br from-white to-zinc-50/80 p-4 shadow-sm ring-1 ring-zinc-950/5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total courses</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
            {loading ? "—" : count}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-linear-to-br from-white to-zinc-50/80 p-4 shadow-sm ring-1 ring-zinc-950/5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">This page</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
            {loading ? "—" : rows.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-linear-to-br from-white to-zinc-50/80 p-4 shadow-sm ring-1 ring-zinc-950/5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Page size</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">{limit}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <BookOpen className="size-4 text-zinc-400" aria-hidden />
          <span className="text-sm font-semibold text-zinc-800">
            {isPlatformAdmin ? "All courses" : "Courses"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100 text-sm">
            <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 md:table-cell">Instructor</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-4">
                        <div className="h-4 max-w-md w-[70%] animate-pulse rounded bg-zinc-100" />
                      </td>
                    </tr>
                  ))
                : rows.map((c) => (
                    <tr key={c.id} className="transition hover:bg-fuchsia-50/30">
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-zinc-900">{c.title}</span>
                      </td>
                      <td className="hidden px-4 py-3.5 text-zinc-600 md:table-cell">
                        {c.instructor_detail?.username ?? `User #${c.instructor}`}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">
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
                          className="border-zinc-200 font-medium"
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
                    <p className="text-zinc-600">No courses yet.</p>
                    {canNewCourse ? (
                      <Button className="mt-4" onPress={() => router.push(ROUTES.ADMIN_COURSES_NEW)}>
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-600">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-zinc-200"
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
            className="gap-1 border-zinc-200"
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
