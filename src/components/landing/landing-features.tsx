import { BookOpen, Layers, Zap } from "lucide-react";

const items = [
  {
    icon: Layers,
    title: "Structured paths",
    body: "Modules and lessons in a clear order so you always know what comes next.",
  },
  {
    icon: BookOpen,
    title: "Depth without noise",
    body: "Text, video, audio, and documents in one place—focused on learning, not juggling tabs.",
  },
  {
    icon: Zap,
    title: "Ship faster",
    body: "Instructors publish and iterate with tools built for real classroom workflows.",
  },
];

export function LandingFeatures() {
  return (
    <section className="border-y border-zinc-200/80 bg-white py-20 dark:border-zinc-800/80 dark:bg-zinc-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-400">
            Platform
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl [text-wrap:balance]">
            Everything you need to teach and learn—nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            A calm LMS experience: fewer distractions, clearer progress, and content that stays
            organized as you grow.
          </p>
        </div>
        <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="group rounded-2xl border border-zinc-100 bg-linear-to-br from-white to-zinc-50/80 p-6 shadow-sm ring-1 ring-zinc-950/5 transition hover:border-fuchsia-100 hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950/90 dark:ring-zinc-800/80 dark:hover:border-fuchsia-900/50"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100 transition group-hover:bg-fuchsia-100 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:ring-fuchsia-900/40 dark:group-hover:bg-fuchsia-900/40">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
