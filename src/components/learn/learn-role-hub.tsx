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
import { ArrowRight } from "lucide-react";

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
      <div className="mt-10 flex items-center gap-2 text-sm text-(--lms-text-muted)">
        <span
          className="size-4 animate-spin rounded-full border-2 border-(--lms-border) border-t-(--lms-accent) dark:border-(--lms-border) dark:border-t-(--lms-accent)"
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
      <section className="mt-10 rounded-2xl border border-(--lms-border) bg-linear-to-br from-(--lms-accent)/90 to-(--lms-accent)/50 p-6 dark:border-(--lms-accent)/40 dark:from-(--lms-accent)/950 dark:to-(--lms-accent)/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--lms-accent) dark:text-(--lms-accent)/30">
          Instructor / admin
        </p>
        <h2 className="mt-1 text-lg font-bold text-(--lms-text) dark:text-(--lms-text)/50">
          Hi, {label}
        </h2>
        <p className="mt-2 text-sm text-(--lms-text) dark:text-(--lms-text)/50">
          Manage course content, modules, and lessons in the studio. Students use this page for
          enrolled courses only.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-(--lms-border) bg-(--lms-surface) p-6 shadow-sm dark:border-(--lms-border) dark:bg-(--lms-surface)/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-(--lms-accent) dark:text-(--lms-accent)/40">
        Your space
      </p>
      <h2 className="mt-1 text-lg font-bold text-(--lms-text) dark:text-(--lms-text)/50">
        Hi, {label}
      </h2>
      <p className="mt-2 text-sm text-(--lms-text-muted) dark:text-(--lms-text-muted)/40">
        Courses you are enrolled in (from the API). Open a classroom to continue learning.
      </p>
      {loadErr ? (
        <p className="mt-4 text-sm text-(--lms-text-muted)">{loadErr}</p>
      ) : enrollments.length === 0 ? (
        <p className="mt-4 text-sm text-(--lms-text-muted)">
          No enrollments yet — pick a course from the catalog and enroll when your backend supports
          it.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {enrollments.map((e) => {
            const title = courses.get(e.course)?.title ?? `Course #${e.course}`;
            return (
              <li key={e.id}>
                <Link
                  href={ROUTES.learnCourse(e.course)}
                  className="block rounded-xl border border-(--lms-border) px-4 py-3 text-sm font-medium text-(--lms-text) transition hover:border-(--lms-accent)/20 hover:bg-(--lms-accent)/50 dark:border-(--lms-border) dark:text-(--lms-text) dark:hover:border-(--lms-accent)/900 dark:hover:bg-(--lms-accent)/20"
                >
                  {title}
                  <span className="mt-0.5 block text-xs font-normal text-(--lms-text-muted)">
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
