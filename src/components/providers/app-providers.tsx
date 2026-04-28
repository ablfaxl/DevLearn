"use client";

import { AdminAuthProvider } from "@/features/auth";
import { NotificationsProvider } from "@/features/notifications";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </AdminAuthProvider>
  );
}
