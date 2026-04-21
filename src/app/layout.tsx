import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { MainShell } from "@/components/lms/main-shell";
import { MobileBottomNav } from "@/components/lms/mobile-bottom-nav";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "LearnHub";

export const metadata: Metadata = {
  title: {
    default: `${appName} · Online courses & classroom`,
    template: `%s · ${appName}`,
  },
  description:
    "Browse courses, learn in a focused classroom with video and documents, and manage content with the instructor studio.",
  openGraph: {
    type: "website",
    siteName: appName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--lms-bg)] text-[var(--lms-text)] antialiased">
        <AppProviders>
          <Header />
          <MainShell>{children}</MainShell>
          <MobileBottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
