import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  image: string;
  title: string;
  description: string;
  price: number;
  link: string;
  category?: string;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CourseCard({
  image,
  title,
  description,
  price,
  link,
  category,
}: CourseCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface)] shadow-lg shadow-black/20 transition-shadow duration-200 hover:border-[var(--lms-accent)]/35">
      <Link
        href={link}
        className="flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-[var(--lms-accent)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lms-bg)]"
      >
        <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden bg-linear-to-br from-black/40 to-[var(--lms-surface-elevated)]">
          <Image
            loading="eager"
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 pt-3">
          <div className="min-h-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[var(--lms-accent)]">
              <Star className="size-3.5 fill-current" aria-hidden />
              <Star className="size-3.5 fill-current" aria-hidden />
              <Star className="size-3.5 fill-current" aria-hidden />
              <Star className="size-3.5 fill-current" aria-hidden />
              <Star className="size-3.5 fill-current opacity-40" aria-hidden />
              <span className="ml-1 text-[11px] font-medium text-[var(--lms-text-subtle)]">(4.8)</span>
            </div>
            {category ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--lms-accent)]">
                {category}
              </p>
            ) : null}
            <h3 className="text-lg font-semibold leading-snug text-[var(--lms-text)] transition-colors group-hover:text-[var(--lms-accent-hover)]">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-[var(--lms-text-muted)]">{description}</p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--lms-border)] pt-3">
            <p className="text-xl font-bold tracking-tight text-[var(--lms-accent)]">{formatPrice(price)}</p>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--lms-text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--lms-accent)]">
              View course
              <span
                aria-hidden
                className="inline-block transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
