import { ArrowRight, Play, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 pb-24 pt-14 sm:pt-20 lg:pb-32 lg:pt-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 90% at 50% -40%, rgba(243, 142, 67, 0.28), transparent 50%),
            radial-gradient(ellipse 80% 60% at 100% 10%, rgba(243, 142, 67, 0.12), transparent 45%),
            radial-gradient(ellipse 70% 50% at 0% 30%, rgba(255, 159, 87, 0.08), transparent 50%)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,0.15)_0%,rgba(9,9,11,0.88)_55%,rgb(9,9,11)_100%)]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16 sm:px-6 lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md">
            <Sparkles className="size-3.5 shrink-0 text-[var(--lms-accent)]" aria-hidden />
            Trusted learning platform · HD lessons · Progress you can see
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-extrabold tracking-tight text-white [text-wrap:balance] sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Learn from real courses. Teach with confidence.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300 sm:text-xl [text-wrap:balance]">
            Browse structured paths, watch lessons in a focused player, and keep your classroom organized—whether
            you&apos;re here to learn or to publish.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--lms-accent)] px-7 text-base font-semibold text-[#1a0f08] shadow-lg shadow-black/40 outline-none ring-offset-2 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--lms-accent)]"
            >
              <Play className="size-4 fill-current opacity-90" aria-hidden />
              Browse catalog
            </Link>
            <Link
              href="/studio"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur outline-none ring-offset-2 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Start teaching
              <ArrowRight className="size-4 opacity-90" aria-hidden />
            </Link>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-400">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400/90" aria-hidden />
              Secure checkout ready
            </li>
            <li className="inline-flex items-center gap-2">
              <Play className="size-4 text-[var(--lms-accent)]/90" aria-hidden />
              Video &amp; document lessons
            </li>
          </ul>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-[var(--lms-accent)]/25 via-transparent to-amber-900/15 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--lms-accent)]/90">Preview</p>
            <p className="mt-2 text-lg font-semibold text-white">What your students see</p>
            <ul className="mt-6 space-y-4 text-sm text-zinc-300">
              <li className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--lms-accent)]/20 text-[var(--lms-accent)]">
                  1
                </span>
                <span>
                  <span className="font-medium text-white">Course overview</span> — hero, price, clear CTAs
                </span>
              </li>
              <li className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-zinc-200">
                  2
                </span>
                <span>
                  <span className="font-medium text-white">Classroom</span> — sidebar curriculum + media player
                </span>
              </li>
              <li className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-200">
                  3
                </span>
                <span>
                  <span className="font-medium text-white">Instructor studio</span> — full course editor
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
