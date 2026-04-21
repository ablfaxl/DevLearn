"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { ApiError, errMessage, getAccessToken } from "@/lib/api/client";
import { enrollInCourse } from "@/lib/api/enrollments";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function CourseEnrollPanel({ courseId }: { courseId: number }) {
  const { profile } = useAdminAuth();
  const [pending, setPending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signedIn = typeof window !== "undefined" && !!getAccessToken();
  const canEnroll = useMemo(() => {
    if (!signedIn) return true;
    if (!profile?.access) return true;
    return profile.access.can_enroll_in_courses;
  }, [profile?.access, signedIn]);

  async function onEnroll() {
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      await enrollInCourse(courseId);
      setInfo("You are enrolled. Open the classroom to start.");
    } catch (e) {
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
          <Link href={ROUTES.ADMIN_LOGIN} className="font-semibold text-[var(--lms-accent)]">
            Sign in
          </Link>{" "}
          (or{" "}
          <Link href="/register" className="font-semibold text-[var(--lms-accent)]">
            register
          </Link>
          ) to enroll when your API is ready.
        </p>
      ) : null}
      {!canEnroll && signedIn ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Your account role is not allowed to enroll in courses from here. Contact an administrator if this is a mistake.
        </p>
      ) : null}
      <Button
        type="button"
        className="h-11 w-full justify-center bg-[var(--lms-accent)] font-semibold text-[#1a0f08] hover:brightness-110"
        isDisabled={pending || !canEnroll}
        onPress={() => void onEnroll()}
      >
        {pending ? "Enrolling…" : "Enroll now"}
      </Button>
      <Link
        href={ROUTES.learnCourse(courseId)}
        className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--lms-accent)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--lms-accent)] shadow-sm outline-none transition hover:bg-[var(--lms-accent)]/10 focus-visible:ring-2 focus-visible:ring-[var(--lms-accent)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lms-bg)]"
      >
        Open classroom
      </Link>
      <Link
        href="/courses"
        className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.1] bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04]"
      >
        Browse more courses
      </Link>
      {info ? <p className="text-center text-xs font-medium text-emerald-700 dark:text-emerald-400">{info}</p> : null}
      {error ? <p className="text-center text-xs text-red-700 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
