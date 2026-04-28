import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative isolate min-h-[72vh] overflow-hidden bg-(--lms-bg) px-4 py-20">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(243, 142, 67, 0.18), transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-20 -z-10 size-72 rounded-full bg-(--lms-accent)/10 blur-3xl animate-[pulse_7s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-28 bottom-8 -z-10 size-80 rounded-full bg-amber-500/10 blur-3xl animate-[pulse_9s_ease-in-out_infinite]"
        aria-hidden
      />

      <div className="mx-auto flex max-w-3xl justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-(--lms-surface)/95 p-8 text-center shadow-2xl shadow-black/35 ring-1 ring-white/8 backdrop-blur-sm sm:p-10">
          <p className="inline-flex rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--lms-accent)">
            Error 404
          </p>
          <h1 className="mt-5 bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            This page doesn&apos;t exist
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            The address may be outdated, or the content has moved. Jump back to the course catalog
            or return home.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex h-11 items-center rounded-xl bg-(--lms-accent) px-6 text-sm font-semibold text-[#1a0f08] shadow-lg shadow-black/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              Browse courses
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
