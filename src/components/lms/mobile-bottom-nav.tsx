"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { canAccessContentStudio } from "@/lib/auth/roles";
import { Bookmark, GraduationCap, Home, MessageCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function activeClass(active: boolean) {
  return active ? "text-[var(--lms-accent)]" : "text-zinc-500";
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { accessToken, role } = useAdminAuth();

  if (pathname.startsWith("/admin")) return null;
  /** Course page uses its own sticky CTAs — avoid stacking two fixed bars. */
  if (/^\/courses\/\d+$/.test(pathname)) return null;

  const youHref = accessToken
    ? canAccessContentStudio(role)
      ? ROUTES.ADMIN_COURSES
      : ROUTES.LEARN
    : ROUTES.COURSES;

  const home = pathname === "/";
  const messages = pathname.startsWith("/messages");
  const coursesNav = pathname.startsWith("/courses");
  const learn = pathname.startsWith("/learn");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#0d0d0d]/95 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-lg md:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        <li className="flex-1">
          <Link
            href={ROUTES.HOME}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wide ${activeClass(home)}`}
          >
            <Home className={`size-6 ${activeClass(home)}`} strokeWidth={home ? 2.25 : 1.75} />
            Home
          </Link>
        </li>
        <li className="flex-1">
          <Link
            href={ROUTES.MESSAGES}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wide ${activeClass(messages)}`}
          >
            <MessageCircle
              className={`size-6 ${activeClass(messages)}`}
              strokeWidth={messages ? 2.25 : 1.75}
            />
            Messages
          </Link>
        </li>
        <li className="flex-1">
          <Link
            href={ROUTES.COURSES}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wide ${activeClass(coursesNav)}`}
          >
            <GraduationCap
              className={`size-6 ${activeClass(coursesNav)}`}
              strokeWidth={coursesNav ? 2.25 : 1.75}
            />
            Courses
          </Link>
        </li>
        <li className="flex-1">
          <Link
            href={ROUTES.LEARN}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wide ${activeClass(learn)}`}
          >
            <Bookmark
              className={`size-6 ${activeClass(learn)}`}
              strokeWidth={learn ? 2.25 : 1.75}
            />
            Saved
          </Link>
        </li>
        <li className="flex-1">
          <Link
            href={youHref}
            className="flex flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
          >
            <UserRound className="size-6 text-zinc-500" strokeWidth={1.75} />
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}
