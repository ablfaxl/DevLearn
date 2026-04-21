"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { getApiConnectionHint, getDjangoAdminUrl } from "@/lib/api/config";
import { userDisplayLabel } from "@/lib/api/users";
import { isStudentRole } from "@/lib/auth/roles";
import { Button } from "@heroui/react";
import { BarChart3, BookOpen, ExternalLink, GraduationCap, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, bootstrapped, logout, profile, profileLoading, role } = useAdminAuth();

  const isLogin = pathname === ROUTES.ADMIN_LOGIN;

  const isPlatformAdmin = profile?.access ? profile.access.can_manage_users : role === "admin";

  useEffect(() => {
    if (!bootstrapped || isLogin || !accessToken || profileLoading) return;
    if (isStudentRole(role)) {
      router.replace(ROUTES.LEARN);
    }
  }, [accessToken, bootstrapped, isLogin, profileLoading, role, router]);

  const shellTitle = useMemo(() => {
    if (isPlatformAdmin || role === "admin") return "Admin";
    if (role === "instructor") return "Instructor";
    return "Studio";
  }, [isPlatformAdmin, role]);

  const shellSubtitle = useMemo(() => {
    if (isPlatformAdmin) return "All courses & content";
    if (role === "instructor") return "Your courses & content";
    return "Course admin";
  }, [isPlatformAdmin, role]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (!bootstrapped) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <div
          className="size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-fuchsia-600 dark:border-zinc-700 dark:border-t-fuchsia-400"
          aria-hidden
        />
        Loading dashboard…
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <div
          className="size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-fuchsia-600 dark:border-zinc-700 dark:border-t-fuchsia-400"
          aria-hidden
        />
        Loading your account…
      </div>
    );
  }

  if (isStudentRole(role)) {
    return null;
  }

  const navLink = (href: string, label: string, icon: React.ReactNode, active: boolean) => (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-white text-fuchsia-900 shadow-sm ring-1 ring-fuchsia-100 dark:bg-zinc-900 dark:text-fuchsia-200 dark:ring-fuchsia-900/40"
          : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition ${
          active
            ? "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-200"
            : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700"
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );

  const displayName = profile ? userDisplayLabel(profile) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-0 px-3 pb-12 pt-4 sm:px-5 lg:gap-8 lg:px-8">
      <aside className="hidden w-64 shrink-0 lg:flex lg:flex-col">
        <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col gap-6 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-zinc-950/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 dark:ring-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-600 to-violet-700 text-white shadow-md">
              <LayoutDashboard className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {shellTitle}
              </p>
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{shellSubtitle}</p>
              {displayName ? (
                <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{displayName}</p>
              ) : null}
              {role ? (
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-fuchsia-600/90 dark:text-fuchsia-400/90">
                  Role: {role}
                </p>
              ) : null}
            </div>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Admin navigation">
            {isPlatformAdmin
              ? navLink(
                  ROUTES.ADMIN_OVERVIEW,
                  "Site overview",
                  <BarChart3 className="size-4" aria-hidden />,
                  pathname === ROUTES.ADMIN_OVERVIEW
                )
              : null}
            {navLink(
              ROUTES.ADMIN_COURSES,
              isPlatformAdmin ? "All courses" : "My courses",
              <BookOpen className="size-4" aria-hidden />,
              pathname.startsWith(ROUTES.ADMIN_COURSES)
            )}
            {profile?.access?.can_access_django_admin ? (
              <a
                href={getDjangoAdminUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700">
                  <ExternalLink className="size-4" aria-hidden />
                </span>
                Django admin
              </a>
            ) : null}
            {navLink(
              ROUTES.LEARN,
              "Learner home",
              <GraduationCap className="size-4" aria-hidden />,
              pathname.startsWith(ROUTES.LEARN)
            )}
          </nav>

          <div className="mt-auto space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p
              className="rounded-lg bg-zinc-50 px-3 py-2 text-[11px] leading-snug text-zinc-500 dark:bg-zinc-950/80 dark:text-zinc-400"
              title={getApiConnectionHint()}
            >
              {getApiConnectionHint()}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-center gap-2 border-zinc-200 dark:border-zinc-700"
              onPress={logout}
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              Log out
            </Button>
            <Link
              href={ROUTES.HOME}
              className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-fuchsia-700 hover:text-fuchsia-900 dark:text-fuchsia-400 dark:hover:text-fuchsia-300"
            >
              View site
              <ExternalLink className="size-3.5 opacity-70" aria-hidden />
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-zinc-950/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 dark:ring-zinc-800 lg:hidden">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {isPlatformAdmin ? (
              <Link href={ROUTES.ADMIN_OVERVIEW} className={pathname === ROUTES.ADMIN_OVERVIEW ? "text-fuchsia-700 dark:text-fuchsia-400" : ""}>
                Overview
              </Link>
            ) : null}
            <Link href={ROUTES.ADMIN_COURSES}>Courses</Link>
            <Link href={ROUTES.LEARN} className="font-normal text-fuchsia-700 dark:text-fuchsia-400">
              Learner home
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-zinc-600 dark:text-zinc-400" onPress={logout}>
              <LogOut className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white/80 p-4 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/70 dark:ring-zinc-800 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
