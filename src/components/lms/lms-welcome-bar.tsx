"use client";

import { ROUTES } from "@/constants";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { useAdminAuth } from "@/features/auth";
import { userDisplayLabel } from "@/lib/api/users";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LmsWelcomeBar() {
  const pathname = usePathname();
  const { accessToken, profile, profileLoading } = useAdminAuth();
  if (pathname !== "/") return null;

  const signedIn = Boolean(accessToken);
  const name =
    profileLoading && signedIn
      ? "…"
      : profile
        ? userDisplayLabel(profile)
        : signedIn
          ? "Learner"
          : null;
  const first = name && name !== "…" ? name.trim().split(/\s+/)[0] : null;

  return (
    <div className="flex items-center justify-between gap-3 border-b  border-white/[0.06] wbg-[var(--lms-bg)] px-4 py-4 sm:px-6 md:hidden lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={ROUTES.HOME}
          className="relative size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10"
          aria-label="Home"
        >
          <Image src="/img/logo.png" alt="" fill className="object-cover" sizes="40px" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Welcome back
          </p>
          <p className="truncate text-lg font-bold text-white">
            {first ? first : signedIn ? "Learner" : "Guest"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {signedIn ? (
          <NotificationsBell className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--lms-surface)] text-zinc-400 transition hover:text-white" />
        ) : null}
        <Link
          href={ROUTES.COURSES}
          className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--lms-surface)] text-zinc-400 transition hover:text-white"
          aria-label="Catalog"
        >
          <ShoppingCart className="size-5" />
        </Link>
      </div>
    </div>
  );
}
