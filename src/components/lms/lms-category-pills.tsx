"use client";
import { Cloud, LayoutGrid, PenTool, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const CATEGORIES = [
  { label: "Cloud computing", href: "/courses?q=cloud", icon: Cloud },
  { label: "Design", href: "/courses?q=design", icon: PenTool },
  { label: "Business", href: "/courses?q=business", icon: TrendingUp },
  { label: "All topics", href: "/courses", icon: LayoutGrid },
] as const;

export function LmsCategoryPills() {
  return (
    <motion.section className="bg-(--lms-bg) py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold tracking-tight text-white">Categories</h2>
        <ul className="mt-4 flex flex-wrap gap-5 flex-row-reverse">
          {CATEGORIES.map(({ label, href, icon: Icon }) => (
            // create motion pill and grid layout with tailwind css
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center w-72 h-36 justify-center gap-2 rounded-xl border border-white/8 bg-(--lms-surface) px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-(--lms-accent)/40 hover:text-white hover:shadow-lg hover:shadow-black/20 focus-visible:ring-2 focus-visible:ring-(--lms-accent) cursor-pointer"
            >
              <Link href={href}>
                <div className="flex items-center justify-center w-full h-full gap-4">
                  <Icon className="size-5 text-(--lms-accent)" aria-hidden fill="currentColor" />{" "}
                  <span className="text-xl font-medium text-zinc-200">{label}</span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
