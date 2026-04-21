import { Quote } from "lucide-react";

const quotes = [
  {
    name: "Alex M.",
    role: "Product designer",
    text: "Finally an LMS UI that doesn’t feel like a spreadsheet. The classroom layout is exactly what we needed for demos.",
  },
  {
    name: "Samira K.",
    role: "Bootcamp lead",
    text: "Clear hierarchy from catalog to lesson content. Our instructors onboard in minutes, not days.",
  },
  {
    name: "Jordan P.",
    role: "Engineering student",
    text: "I can actually find the next video without losing context. The player feels modern.",
  },
];

export function LandingTestimonials() {
  return (
    <section className="bg-white py-20 dark:bg-zinc-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Built for teams who ship courses
          </h2>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Replace placeholder copy with real testimonials once your cohorts go live.
          </p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <li
              key={q.name}
              className="flex flex-col rounded-2xl border border-zinc-200/90 bg-linear-to-b from-white to-zinc-50/90 p-6 shadow-md ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 dark:ring-zinc-800"
            >
              <Quote className="size-8 text-fuchsia-500/80 dark:text-fuchsia-400/70" aria-hidden />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">&ldquo;{q.text}&rdquo;</p>
              <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p className="font-semibold text-zinc-900 dark:text-white">{q.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{q.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
