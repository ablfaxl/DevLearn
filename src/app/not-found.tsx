import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-zinc-50 px-4 py-20 text-center dark:bg-zinc-950">
      <p className="text-sm font-semibold uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-400">
        404
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
        The link may be broken or the page was removed. Head back to the catalog or home.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/courses"
          className="inline-flex h-11 items-center rounded-xl bg-fuchsia-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-fuchsia-500"
        >
          Browse courses
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
