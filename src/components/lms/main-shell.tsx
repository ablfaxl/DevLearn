"use client";

import { usePathname } from "next/navigation";

/**
 * Bottom safe-area: mobile bottom nav on most routes; course detail uses its own sticky bar instead.
 */
export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCourseDetail = /^\/courses\/\d+$/.test(pathname);

  const pad =
    isAdmin || pathname.startsWith("/studio")
      ? ""
      : isCourseDetail
        ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0"
        : "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0";

  return <main className={`flex min-h-0 flex-1 flex-col ${pad}`}>{children}</main>;
}
