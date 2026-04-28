"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { ApiError, errMessage } from "@/lib/api/client";
import { enrollInCourse, listMyEnrollments } from "@/lib/api/enrollments";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function CourseEnrollPanel({ courseId }: { courseId: number }) {
  const { profile, accessToken, bootstrapped } = useAdminAuth();
  const [pending, setPending] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signedIn = bootstrapped && !!accessToken;
  const canEnroll = useMemo(() => {
    if (!signedIn) return true;
    if (!profile?.access) return true;
    return profile.access.can_enroll_in_courses;
  }, [profile?.access, signedIn]);

  useEffect(() => {
    if (!signedIn) {
      setEnrolled(false);
      return;
    }

    let cancelled = false;
    setCheckingEnrollment(true);
    void (async () => {
      try {
        const page = await listMyEnrollments({ limit: 250 });
        if (cancelled) return;
        const rows = page.results ?? [];
        setEnrolled(rows.some((r) => r.course === courseId));
      } catch {
        if (!cancelled) setEnrolled(false);
      } finally {
        if (!cancelled) setCheckingEnrollment(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId, signedIn]);

  async function onEnroll() {
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      await enrollInCourse(courseId);
      setEnrolled(true);
      setInfo("You are enrolled. Open the classroom to start.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        const msg = errMessage(e).toLowerCase();
        if (msg.includes("already") && msg.includes("enroll")) {
          setEnrolled(true);
          setInfo("You are already enrolled. Open the classroom to continue.");
          setPending(false);
          return;
        }
      }
      if (e instanceof ApiError && e.status === 401) {
        setError("Sign in to enroll. Use the same account your API expects for students.");
      } else {
        setError(errMessage(e));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {!signedIn ? (
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-400">
          <Link href={ROUTES.ADMIN_LOGIN} className="font-semibold text-(--lms-accent)">
            Sign in
          </Link>{" "}
          (or{" "}
          <Link href="/register" className="font-semibold text-(--lms-accent)">
            register
          </Link>
          ) to enroll when your API is ready.
        </p>
      ) : null}
      {!canEnroll && signedIn ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Your account role is not allowed to enroll in courses from here. Contact an administrator
          if this is a mistake.
        </p>
      ) : null}
      {enrolled ? (
        <p className="rounded-lg border border-emerald-900/40 bg-emerald-950/25 px-3 py-2 text-center text-sm font-medium text-emerald-200">
          You are enrolled in this course.
        </p>
      ) : (
        <Button
          type="button"
          className="h-11 w-full justify-center bg-(--lms-accent) font-semibold text-[#1a0f08] hover:brightness-110"
          isDisabled={pending || checkingEnrollment || !canEnroll}
          onPress={() => void onEnroll()}
        >
          {checkingEnrollment ? "Checking…" : pending ? "Enrolling…" : "Enroll now"}
        </Button>
      )}
      {enrolled ? (
        <Link
          href={ROUTES.learnCourse(courseId)}
          className="inline-flex w-full items-center justify-center rounded-xl border border-(--lms-accent) bg-transparent px-4 py-3 text-sm font-semibold text-(--lms-accent) shadow-sm outline-none transition hover:bg-(--lms-accent)/10 focus-visible:ring-2 focus-visible:ring-(--lms-accent)/50 focus-visible:ring-offset-2 focus-visible:ring-offset-(--lms-bg)"
        >
          Open classroom
        </Link>
      ) : null}
      {enrolled ? null : (
        <Link
          href="/courses"
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/4"
        >
          Browse more courses
        </Link>
      )}
      {info ? (
        <p className="text-center text-xs font-medium text-emerald-700 dark:text-emerald-400">
          {info}
        </p>
      ) : null}
      {error ? <p className="text-center text-xs text-red-700 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
