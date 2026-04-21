import { ROUTES } from "@/constants";
import type { FeaturedCoursePreview } from "@/lib/data/featured-courses-server";
import { parseCoursePrice } from "@/lib/utils/price";
import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMAGE = "/img/docker_thumnail.webp";

const placeholders = [
  {
    title: "Launch faster with a clear syllabus",
    body: "Connect your Django API to show live courses here—until then, explore our demo catalog.",
  },
  {
    title: "Built for instructors",
    body: "Publish modules, lessons, and rich content blocks with validation that matches your backend.",
  },
  {
    title: "Made for learners",
    body: "Search, filter, and jump back in—without losing context across devices.",
  },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function LandingCourses({ featured }: { featured: FeaturedCoursePreview[] | null }) {
  const hasApi = featured && featured.length > 0;

  return (
    <section className="border-t border-white/[0.06] bg-[var(--lms-bg)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--lms-accent)]">Featured</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Popular right now</h2>
            <p className="mt-3 max-w-xl text-zinc-500">
              {hasApi
                ? "Pulled live from your public API (server-side, revalidated every few minutes)."
                : "We could not load public courses yet—check the API and environment variables."}
            </p>
          </div>
          <Link href={ROUTES.COURSES} className="text-sm font-semibold text-[var(--lms-accent)] hover:underline">
            View full catalog →
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hasApi && featured
            ? featured.map((c) => {
                const img = c.thumbnail_url ?? FALLBACK_IMAGE;
                const cat = c.category?.trim();
                const price = formatPrice(parseCoursePrice(c.price));
                return (
                  <li
                    key={c.id}
                    className="flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--lms-surface)] shadow-lg shadow-black/20 transition hover:border-[var(--lms-accent)]/35"
                  >
                    <Link
                      href={ROUTES.courseDetail(c.id)}
                      className="relative block outline-none focus-visible:ring-2 focus-visible:ring-[var(--lms-accent)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lms-bg)]"
                    >
                      <div className="relative aspect-16/10 w-full bg-black/40">
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-amber-100 backdrop-blur-sm">
                          ★ 4.8
                        </span>
                        <span className="absolute end-3 top-3 rounded-md bg-[var(--lms-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1a0f08]">
                          Best seller
                        </span>
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      {cat ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{cat}</span>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Course</span>
                      )}
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-white [text-wrap:balance]">
                        {c.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-500">{c.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-lg font-bold tabular-nums text-[var(--lms-accent)]">{price}</p>
                        <Link
                          href={ROUTES.courseDetail(c.id)}
                          className="text-sm font-semibold text-white/90 hover:text-[var(--lms-accent)]"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })
            : placeholders.map((p) => (
                <li
                  key={p.title}
                  className="rounded-3xl border border-dashed border-white/[0.12] bg-[var(--lms-surface)]/50 p-6 text-zinc-400"
                >
                  <h3 className="text-lg font-semibold text-zinc-100 [text-wrap:balance]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{p.body}</p>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
