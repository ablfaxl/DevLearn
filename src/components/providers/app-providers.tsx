"use client";

import { AdminAuthProvider } from "@/features/auth";
import { NotificationsProvider } from "@/features/notifications";
import { ThemeProvider } from "next-themes";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <AdminAuthProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
