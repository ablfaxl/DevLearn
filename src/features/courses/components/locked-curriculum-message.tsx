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
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
      {reason === "no_token" ? (
        <>
          <p className="font-semibold">Lesson text and media are hidden until you sign in.</p>
          <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">
            <Link
              href={ROUTES.ADMIN_LOGIN}
              className="font-semibold text-fuchsia-800 underline-offset-2 hover:underline dark:text-fuchsia-300"
            >
              Sign in
            </Link>
            {" · "}
            <Link
              href={coursePage}
              className="font-semibold text-fuchsia-800 underline-offset-2 hover:underline dark:text-fuchsia-300"
            >
              Enroll from the course page
            </Link>
          </p>
        </>
      ) : reason === "not_enrolled" ? (
        <>
          <p className="font-semibold">You are signed in but not enrolled in this course.</p>
          <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">
            <Link
              href={coursePage}
              className="font-semibold text-fuchsia-800 underline-offset-2 hover:underline dark:text-fuchsia-300"
            >
              Open the course page and enroll
            </Link>
            , then return here.
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold">You do not have access to this material yet.</p>
          <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">
            Enroll in the course (or use an account with access), then reload this page.{" "}
            <Link
              href={coursePage}
              className="font-semibold text-fuchsia-800 underline-offset-2 hover:underline dark:text-fuchsia-300"
            >
              Open course page
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
