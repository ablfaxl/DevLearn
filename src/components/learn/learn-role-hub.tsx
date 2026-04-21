"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { ApiError } from "@/lib/api/client";
import { getCourse } from "@/lib/api/courses";
import { listMyEnrollments } from "@/lib/api/enrollments";
import { canAccessContentStudio } from "@/lib/auth/roles";
import type { Course, Enrollment } from "@/lib/api/types";
import { userDisplayLabel } from "@/lib/api/users";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export function LearnRoleHub() {
  const { accessToken, bootstrapped, role, profile, profileLoading } = useAdminAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Map<number, Course>>(new Map());
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    if (!accessToken || canAccessContentStudio(role)) return;
    setLoadErr(null);
    try {
      const res = await listMyEnrollments({ limit: 50 });
      const rows = unwrapResults<Enrollment>(res);
      setEnrollments(rows);
      const ids = [...new Set(rows.map((e) => e.course))];
      const map = new Map<number, Course>();
      await Promise.all(
        ids.map(async (id) => {
          try {
            const c = await getCourse(id);
            map.set(id, c);
          } catch {
            /* title fallback */
          }
        })
      );
      setCourses(map);
    } catch (e) {
      setLoadErr(e instanceof ApiError ? e.message : "Could not load enrollments");
    }
  }, [accessToken, role]);

  useEffect(() => {
    if (!bootstrapped || profileLoading) return;
    void loadEnrollments();
  }, [bootstrapped, profileLoading, loadEnrollments]);

  if (!bootstrapped || profileLoading) {
    return (
      <div className="mt-10 flex items-center gap-2 text-sm text-zinc-500">
        <span
          className="size-4 animate-spin rounded-full border-2 border-zinc-200 border-t-fuchsia-600 dark:border-zinc-600 dark:border-t-fuchsia-400"
          aria-hidden
        />
        Loading your hub…
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  const label = profile ? userDisplayLabel(profile) : "Account";

  if (canAccessContentStudio(role)) {
    return (
      <section className="mt-10 rounded-2xl border border-violet-200/80 bg-linear-to-br from-violet-50/90 to-fuchsia-50/50 p-6 dark:border-violet-900/40 dark:from-violet-950/40 dark:to-fuchsia-950/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
          Instructor / admin
        </p>
        <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">Hi, {label}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage course content, modules, and lessons in the studio. Students use this page for enrolled courses only.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={ROUTES.ADMIN_COURSES}
            className="inline-flex items-center rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-fuchsia-500"
          >
            Open studio →
          </Link>
          <Link
            href="/messages"
            className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Messages
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-400">Your space</p>
      <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">Hi, {label}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Courses you are enrolled in (from the API). Open a classroom to continue learning.
      </p>
      {loadErr ? (
        <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">{loadErr}</p>
      ) : enrollments.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No enrollments yet — pick a course from the catalog and enroll when your backend supports it.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {enrollments.map((e) => {
            const title = courses.get(e.course)?.title ?? `Course #${e.course}`;
            return (
              <li key={e.id}>
                <Link
                  href={ROUTES.learnCourse(e.course)}
                  className="block rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 transition hover:border-fuchsia-200 hover:bg-fuchsia-50/50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-fuchsia-900/40 dark:hover:bg-fuchsia-950/20"
                >
                  {title}
                  <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                    Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
