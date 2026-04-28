"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { useNotificationsOptional } from "@/features/notifications";
import { HeaderSearch } from "@/components/layout/header-search";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { canAccessContentStudio } from "@/lib/auth/roles";
import { userDisplayLabel } from "@/lib/api/users";
import { Button } from "@heroui/react";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const baseNav: { href: string; label: string }[] = [
  { href: "/courses", label: "Explore" },
  { href: "/learn", label: "My learning" },
];

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/learn") return pathname.startsWith("/learn");
  if (href === "/studio") return pathname.startsWith("/admin") || pathname.startsWith("/studio");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = navActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition text-nowrap ${
        active
          ? "bg-[var(--lms-accent)]/15 text-[var(--lms-accent)]"
          : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { accessToken, logout, profile, profileLoading, role } = useAdminAuth();
  const accountMenuRef = useRef<HTMLDetailsElement>(null);

  const navItems = useMemo(() => {
    const items = [...baseNav];
    return items;
  }, [role]);

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "LearnHub";
  const signedIn = Boolean(accessToken);
  const headerLabel = profileLoading
    ? "…"
    : profile
      ? userDisplayLabel(profile)
      : signedIn
        ? "Account"
        : null;
  const showStudioLinks = canAccessContentStudio(role);
  const notifications = useNotificationsOptional();

  const hideOnMobileHome = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/[0.08] bg-[#0d0d0d]/90 shadow-sm backdrop-blur-xl ${hideOnMobileHome ? "max-md:hidden" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--lms-accent)]/50"
        >
          <Image
            src="/img/logo.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-xl object-cover ring-1 ring-white/10"
          />
          <span className="hidden font-semibold tracking-tight text-white sm:inline sm:max-w-40 sm:truncate">
            {appName}
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="w-full flex items-center justify-end">
          <HeaderSearch />

          {signedIn && headerLabel ? (
            <details ref={accountMenuRef} className="relative hidden sm:block">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-100 outline-none ring-offset-2 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[var(--lms-accent)]/40 [&::-webkit-details-marker]:hidden">
                <span
                  className="max-w-40 truncate"
                  title={profile ? userDisplayLabel(profile) : undefined}
                >
                  {headerLabel}
                </span>
                <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
              </summary>
              <div className="absolute end-0 z-50 mt-1 min-w-48 rounded-xl border border-white/[0.1] bg-[var(--lms-surface)] py-1 shadow-lg">
                <Link
                  href={ROUTES.NOTIFICATIONS}
                  className="block px-3 py-2 text-sm text-zinc-100 hover:bg-white/[0.06]"
                  onClick={() => accountMenuRef.current?.removeAttribute("open")}
                >
                  Notifications
                  {(notifications?.unreadCount ?? 0) > 0 ? (
                    <span className="ms-2 text-[var(--lms-accent)]">
                      ({notifications?.unreadCount})
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={ROUTES.LEARN}
                  className="block px-3 py-2 text-sm text-nowrap text-zinc-100 hover:bg-white/[0.06]"
                  onClick={() => accountMenuRef.current?.removeAttribute("open")}
                >
                  My Learning
                </Link>
                {showStudioLinks ? (
                  <Link
                    href={ROUTES.ADMIN_COURSES}
                    className="block px-3 py-2 text-sm text-zinc-100 hover:bg-white/[0.06]"
                    onClick={() => accountMenuRef.current?.removeAttribute("open")}
                  >
                    Instructor Studio
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-start text-sm text-zinc-100 hover:bg-white/[0.06]"
                  onClick={() => {
                    accountMenuRef.current?.removeAttribute("open");
                    logout();
                  }}
                >
                  Log out
                </button>
              </div>
            </details>
          ) : null}

          {!signedIn ? (
            <>
              <Link
                href={ROUTES.REGISTER}
                className="hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
              >
                Sign up
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex h-9 items-center rounded-lg bg-[var(--lms-accent)] px-4 text-sm font-semibold text-[#1a0f08] shadow-sm transition hover:brightness-110"
              >
                Log in
              </Link>
            </>
          ) : null}

          {signedIn ? <NotificationsBell /> : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-w-0 px-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onPress={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 top-16 z-40 flex flex-col bg-[var(--lms-bg)]/98 p-4 pb-8 backdrop-blur-md md:hidden">
          <div className="mb-4 shrink-0">
            <HeaderSearch />
          </div>
          {signedIn && headerLabel ? (
            <div className="mb-3 rounded-xl border border-white/[0.08] bg-[var(--lms-surface)] px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Signed in</p>
              <p className="truncate text-sm font-semibold text-white">{headerLabel}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={ROUTES.LEARN}
                  className="text-sm font-medium text-[var(--lms-accent)] hover:underline"
                  onClick={close}
                >
                  My learning
                </Link>
                {showStudioLinks ? (
                  <Link
                    href={ROUTES.ADMIN_COURSES}
                    className="text-sm font-medium text-[var(--lms-accent)] hover:underline"
                    onClick={close}
                  >
                    Studio
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="text-sm font-medium text-zinc-400 hover:underline"
                  onClick={() => {
                    logout();
                    close();
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          ) : null}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Mobile">
            {signedIn ? (
              <Link
                href={ROUTES.NOTIFICATIONS}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/[0.06]"
                onClick={close}
              >
                Notifications
                {(notifications?.unreadCount ?? 0) > 0 ? (
                  <span className="ms-2 rounded-full bg-[var(--lms-accent)] px-2 py-0.5 text-[11px] font-bold text-[#1a0f08]">
                    {notifications!.unreadCount > 9 ? "9+" : notifications!.unreadCount}
                  </span>
                ) : null}
              </Link>
            ) : null}
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} onNavigate={close} />
            ))}
            {!signedIn ? (
              <>
                <Link
                  href={ROUTES.REGISTER}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400"
                  onClick={close}
                >
                  Create account
                </Link>
                <Link
                  href={ROUTES.LOGIN}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--lms-accent)]"
                  onClick={close}
                >
                  Log in
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
