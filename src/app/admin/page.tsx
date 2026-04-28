"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Platform admins → site overview; instructors → course list (overview API is 403 for them).
 */
export default function AdminIndexPage() {
  const { bootstrapped, profile, role } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!bootstrapped) return;
    const isPlatformAdmin = profile?.access ? profile.access.can_manage_users : role === "admin";
    router.replace(isPlatformAdmin ? ROUTES.ADMIN_OVERVIEW : ROUTES.ADMIN_COURSES);
  }, [bootstrapped, profile, role, router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-(--lms-text-muted)">
      <div
        className="size-8 animate-spin rounded-full border-2 border-(--lms-border)/80 border-t-(--lms-accent)"
        aria-hidden
      />
      Opening studio…
    </div>
  );
}
