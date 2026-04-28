import { LearnRoleHub } from "@/components/learn/learn-role-hub";
import Link from "next/link";

export const metadata = {
  title: "My learning",
  description: "Continue courses and track progress.",
};

export default function LearnHubPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-(--lms-text)">My learning</h1>
      <p className="mt-3 text-(--lms-text-muted)">
        Open any course you have access to. After enrolling (when your API supports it), your
        classrooms appear here — for now browse the catalog and use <strong>Open classroom</strong>{" "}
        from a course page.
      </p>
      <LearnRoleHub />
      <ul className="mt-10 space-y-4">
        <li>
          <Link
            href="/courses"
            className="block rounded-2xl border border-(--lms-border) bg-(--lms-surface) p-6 font-semibold text-(--lms-accent) shadow-sm transition hover:border-(--lms-accent)/45 hover:bg-(--lms-surface-elevated)"
          >
            Browse catalog →
          </Link>
        </li>
        <li>
          <Link
            href="/messages"
            className="block rounded-2xl border border-(--lms-border) bg-(--lms-surface) p-6 font-semibold text-(--lms-text) shadow-sm transition hover:border-(--lms-accent)/30 hover:bg-(--lms-surface-elevated)"
          >
            Messages (instructor & student) →
          </Link>
        </li>
      </ul>
    </div>
  );
}
