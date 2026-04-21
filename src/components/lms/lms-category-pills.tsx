import { Cloud, LayoutGrid, PenTool, TrendingUp } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { label: "Cloud computing", href: "/courses?q=cloud", icon: Cloud },
  { label: "Design", href: "/courses?q=design", icon: PenTool },
  { label: "Business", href: "/courses?q=business", icon: TrendingUp },
  { label: "All topics", href: "/courses", icon: LayoutGrid },
] as const;

export function LmsCategoryPills() {
  return (
    <section className="border-b border-white/[0.06] bg-[var(--lms-bg)] py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Categories</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[var(--lms-surface)] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-[var(--lms-accent)]/40 hover:text-white"
              >
                <Icon className="size-4 text-[var(--lms-accent)]" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
