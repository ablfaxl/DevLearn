import { ROUTES } from "@/constants";
import Link from "next/link";

import type { CurriculumBlockReason } from "@/features/courses/types";

type LockedCurriculumMessageProps = {
  reason: Exclude<CurriculumBlockReason, null>;
  courseId: number;
};

export function LockedCurriculumMessage({ reason, courseId }: LockedCurriculumMessageProps) {
  const coursePage = ROUTES.courseDetail(courseId);

  return (
    <div className="rounded-xl border border-(--lms-border) bg-(--lms-surface-elevated) p-4 text-sm leading-relaxed text-(--lms-text) dark:border-(--lms-border)/40 dark:bg-(--lms-surface-elevated)/25 dark:text-(--lms-text)/90">
      {reason === "no_token" ? (
        <>
          <p className="font-semibold">Lesson text and media are hidden until you sign in.</p>
          <p className="mt-2 text-(--lms-text)/90 dark:text-(--lms-text)/90">
            <Link
              href={ROUTES.ADMIN_LOGIN}
              className="font-semibold text-(--lms-accent) underline-offset-2 hover:underline dark:text-(--lms-accent)/30"
            >
              Sign in
            </Link>
            {" · "}
            <Link
              href={coursePage}
              className="font-semibold text-(--lms-accent) underline-offset-2 hover:underline dark:text-(--lms-accent)/30"
            >
              Enroll from the course page
            </Link>
          </p>
        </>
      ) : reason === "not_enrolled" ? (
        <>
          <p className="font-semibold">You are signed in but not enrolled in this course.</p>
          <p className="mt-2 text-(--lms-text)/90 dark:text-(--lms-text)/90">
            <Link
              href={coursePage}
              className="font-semibold text-(--lms-accent) underline-offset-2 hover:underline dark:text-(--lms-accent)/30"
            >
              Open the course page and enroll
            </Link>
            , then return here.{" "}
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold">You do not have access to this material yet.</p>
          <p className="mt-2 text-(--lms-text)/90 dark:text-(--lms-text)/90">
            Enroll in the course (or use an account with access), then reload this page.{" "}
            <Link
              href={coursePage}
              className="font-semibold text-(--lms-accent) underline-offset-2 hover:underline dark:text-(--lms-accent)/30"
            >
              Open course page
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
