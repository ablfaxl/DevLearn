import { LearnRoleHub } from "@/components/learn/learn-role-hub";
import Link from "next/link";

export const metadata = {
  title: "My learning",
  description: "Continue courses and track progress.",
};

export default function LearnHubPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">My learning</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Open any course you have access to. After enrolling (when your API supports it), your classrooms appear
        here — for now browse the catalog and use <strong>Open classroom</strong> from a course page.
      </p>
      <LearnRoleHub />
      <ul className="mt-10 space-y-4">
        <li>
          <Link
            href="/courses"
            className="block rounded-2xl border border-zinc-200 bg-white p-6 font-semibold text-fuchsia-800 shadow-sm transition hover:border-fuchsia-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-fuchsia-300 dark:hover:border-fuchsia-900/50"
          >
            Browse catalog →
          </Link>
        </li>
        <li>
          <Link
            href="/messages"
            className="block rounded-2xl border border-zinc-200 bg-white p-6 font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Messages (instructor & student) →
          </Link>
        </li>
      </ul>
    </div>
  );
}
