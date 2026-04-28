import { ROUTES } from "@/constants";
import Link from "next/link";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div
        className="absolute inset-0 bg-linear-to-br from-fuchsia-600 via-fuchsia-700 to-violet-800"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
          Ready to run your next cohort?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-fuchsia-100/95">
          Start from the catalog, refine with filters, and keep your curriculum organized in one
          place.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ROUTES.COURSES}
            className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-base font-semibold text-fuchsia-800 shadow-lg outline-none ring-offset-2 transition hover:bg-fuchsia-50 focus-visible:ring-2 focus-visible:ring-white"
          >
            Get started
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex h-12 items-center rounded-xl border border-white/40 px-8 text-base font-semibold text-white outline-none ring-offset-2 transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Open admin
          </Link>
        </div>
      </div>
    </section>
  );
}
