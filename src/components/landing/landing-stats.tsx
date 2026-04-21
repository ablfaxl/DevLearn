import type { PublicStats } from "@/lib/data/stats-server";

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

export function LandingStats({ stats }: { stats: PublicStats | null }) {
  if (!stats) return null;

  return (
    <section
      className="border-y border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-900/40 sm:py-12"
      aria-label="Platform stats"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:gap-10 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {formatCount(stats.courses_count)}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">Courses</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {formatCount(stats.learners_count)}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">Learners</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {formatCount(stats.instructors_count)}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">Instructors</p>
        </div>
      </div>
    </section>
  );
}
