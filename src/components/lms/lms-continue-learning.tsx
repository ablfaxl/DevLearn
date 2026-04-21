import { ROUTES } from "@/constants";
import type { FeaturedCoursePreview } from "@/lib/data/featured-courses-server";
import { parseCoursePrice } from "@/lib/utils/price";
import { CircularProgress } from "@/components/lms/circular-progress";
import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMAGE = "/img/docker_thumnail.webp";

/** Stable pseudo-progress from id for empty-state demos (replace with real progress when API supports it). */
function demoProgress(id: number): number {
  return 18 + (id % 7) * 11;
}

export function LmsContinueLearning({ courses }: { courses: FeaturedCoursePreview[] | null }) {
  const list = courses ?? [];
  if (!list.length) return null;

  return (
    <section className="border-b border-white/[0.06] bg-[var(--lms-bg)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-bold tracking-tight text-white">Continue learning</h2>
          <Link href={ROUTES.COURSES} className="text-xs font-semibold text-[var(--lms-accent)] hover:underline">
            See all
          </Link>
        </div>
        <ul className="mt-5 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.slice(0, 8).map((c) => {
            const img = c.thumbnail_url ?? FALLBACK_IMAGE;
            const pct = demoProgress(c.id);
            return (
              <li key={c.id} className="w-[min(280px,78vw)] shrink-0">
                <Link
                  href={ROUTES.courseDetail(c.id)}
                  className="flex gap-4 rounded-2xl border border-white/[0.08] bg-[var(--lms-surface)] p-4 outline-none transition hover:border-[var(--lms-accent)]/35 hover:shadow-lg hover:shadow-black/20 focus-visible:ring-2 focus-visible:ring-[var(--lms-accent)]"
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-black/40">
                    <Image src={img} alt="" fill className="object-cover" sizes="112px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{c.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {c.category?.trim() ?? "Course"} · from {formatPrice(parseCoursePrice(c.price))}
                    </p>
                  </div>
                  <CircularProgress percent={pct} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    n
  );
}
