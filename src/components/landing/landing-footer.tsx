import { ROUTES } from "@/constants";
import Link from "next/link";

const columns = [
  {
    title: "Learn",
    links: [
      { href: ROUTES.COURSES, label: "Explore courses" },
      { href: ROUTES.LEARN, label: "My learning" },
      { href: ROUTES.REGISTER, label: "Create account" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: ROUTES.COURSES, label: "Courses" },
      { href: ROUTES.MESSAGES, label: "Messages" },
      { href: ROUTES.NOTIFICATIONS, label: "Notifications" },
    ],
  },
];

export function LandingFooter() {
  const year = new Date().getFullYear();
  const name = process.env.NEXT_PUBLIC_APP_NAME ?? "LearnHub";

  return (
    <footer className="border-t border-zinc-200 bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              A focused learning experience: catalog, classroom, and instructor tools in one
              cohesive product surface.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-700 transition hover:text-fuchsia-700 dark:text-zinc-300 dark:hover:text-fuchsia-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500 sm:flex-row">
          <p>
            © {year} {name}. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Made for production LMS deployments.
          </p>
        </div>
      </div>
    </footer>
  );
}
