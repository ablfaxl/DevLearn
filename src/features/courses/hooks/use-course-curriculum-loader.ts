"use client";

import { ApiError, getAccessToken } from "@/lib/api/client";
import { getCourseCurriculum } from "@/lib/api/courses";
import { listMyEnrollments } from "@/lib/api/enrollments";
import type { CourseDetail, UserProfile } from "@/lib/api/types";
import { getCurrentUserProfile } from "@/lib/api/users";
import { canLoadFullCurriculum } from "@/features/courses/lib/curriculum-access-policy";
import type { CurriculumBlockReason } from "@/features/courses/types";
import { useEffect, useRef, useState } from "react";

export type { CurriculumBlockReason } from "@/features/courses/types";

/**
 * Loads full curriculum only when the user is allowed (enrollment or staff flags from `/me/`).
 * Keeps `course` on the public outline until then.
 */
export function useCourseCurriculumLoader(courseId: number, outlineCourse: CourseDetail) {
  const outlineRef = useRef(outlineCourse);
  outlineRef.current = outlineCourse;

  const [course, setCourse] = useState<CourseDetail>(outlineCourse);
  const [curriculumLoading, setCurriculumLoading] = useState(true);
  const [fullCurriculumLoaded, setFullCurriculumLoaded] = useState(false);
  const [curriculumBlocked, setCurriculumBlocked] = useState<CurriculumBlockReason>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setCurriculumBlocked("no_token");
      setFullCurriculumLoaded(false);
      setCurriculumLoading(false);
      return;
    }

    let cancelled = false;
    setCurriculumLoading(true);
    setCurriculumBlocked(null);

    void (async () => {
      try {
        const [profileSettled, enrollmentsSettled] = await Promise.allSettled([
          getCurrentUserProfile(),
          listMyEnrollments({ limit: 250 }),
        ]);

        if (cancelled) return;

        let profile: UserProfile | null = null;
        if (profileSettled.status === "fulfilled") {
          profile = profileSettled.value;
        } else {
          const e = profileSettled.reason;
          if (e instanceof ApiError && e.status === 401) {
            setCourse(outlineRef.current);
            setFullCurriculumLoaded(false);
            setCurriculumBlocked("no_token");
            return;
          }
          profile = null;
        }

        if (enrollmentsSettled.status === "rejected") {
          const e = enrollmentsSettled.reason;
          if (e instanceof ApiError && e.status === 401) {
            setCourse(outlineRef.current);
            setFullCurriculumLoaded(false);
            setCurriculumBlocked("no_token");
            return;
          }
          setCourse(outlineRef.current);
          setFullCurriculumLoaded(false);
          setCurriculumBlocked("forbidden");
          return;
        }

        const enrollments = enrollmentsSettled.value;
        const rows = enrollments.results ?? [];
        if (!canLoadFullCurriculum(profile, courseId, rows)) {
          setCourse(outlineRef.current);
          setFullCurriculumLoaded(false);
          setCurriculumBlocked("not_enrolled");
          return;
        }

        const full = await getCourseCurriculum(courseId);
        if (cancelled) return;
        setCourse(full);
        setFullCurriculumLoaded(true);
        setCurriculumBlocked(null);
      } catch {
        if (cancelled) return;
        setCourse(outlineRef.current);
        setFullCurriculumLoaded(false);
        setCurriculumBlocked("forbidden");
      } finally {
        if (!cancelled) setCurriculumLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return {
    course,
    curriculumLoading,
    fullCurriculumLoaded,
    curriculumBlocked,
  };
}
