"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { ApiError } from "@/lib/api/client";
import { getAdminOverview } from "@/lib/api/admin-overview";
import type { AdminOverviewResponse } from "@/lib/api/types";
import { Button } from "@heroui/react";
import { BarChart3, BookOpen, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatRecentRow(row: Record<string, unknown>): string {
  if (typeof row.title === "string") return row.title;
  if (typeof row.username === "string") return row.username;
  if (typeof row.email === "string") return row.email;
  if (typeof row.id === "number") return `#${row.id}`;
  return JSON.stringify(row).slice(0, 80);
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const { bootstrapped, profile, role } = useAdminAuth();
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlatformAdmin = useMemo(
    () => (profile?.access ? profile.access.can_manage_users : role === "admin"),
    [profile?.access, role]
  );

  useEffect(() => {
    if (!bootstrapped) return;
    if (!isPlatformAdmin) {
      router.replace(ROUTES.ADMIN_COURSES);
    }
  }, [bootstrapped, isPlatformAdmin, router]);

  const load = useCallback(async () => {
    if (!isPlatformAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const o = await getAdminOverview();
      setData(o);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError("This dashboard is only available to platform administrators.");
      } else if (e instanceof ApiError && e.status === 404) {
        setError(
          "Endpoint not found. Add GET /api/v1/admin/overview/ on the server (see docs/lms-course-api-spec.md)."
        );
      } else {
        setError(e instanceof ApiError ? e.message : "Failed to load overview.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin]);

  useEffect(() => {
    if (!bootstrapped || !isPlatformAdmin) return;
    void load();
  }, [bootstrapped, isPlatformAdmin, load]);

  if (!bootstrapped || !isPlatformAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Checking access…
      </div>
    );
  }

  const countEntries = data ? Object.entries(data.counts) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--lms-accent)]">Platform</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--lms-text)]">Site overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--lms-text-muted)]">
            Live from <code className="rounded bg-black/30 px-1 text-xs">GET /api/v1/admin/overview/</code> — totals
            and recent activity. Shape of <code className="text-xs">counts</code> and{" "}
            <code className="text-xs">recent</code> follows your Django implementation.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 border-white/15"
          onPress={() => void load()}
          isDisabled={loading}
        >
          <RefreshCw className={`me-2 size-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          {error}{" "}
          <Link href={ROUTES.ADMIN_COURSES} className="font-semibold text-[var(--lms-accent)] underline">
            Go to courses
          </Link>
        </div>
      ) : null}

      <section aria-labelledby="counts-heading">
        <h2 id="counts-heading" className="sr-only">
          Counts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading && countEntries.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl border border-white/[0.08] bg-[var(--lms-surface)]"
                />
              ))
            : countEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface)] p-5 shadow-lg shadow-black/20"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--lms-text-subtle)]">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--lms-text)]">{value}</p>
                </div>
              ))}
        </div>
        {!loading && countEntries.length === 0 && !error ? (
          <p className="mt-4 text-sm text-[var(--lms-text-muted)]">
            No <code className="text-xs">counts</code> keys returned yet — extend the API response or check auth.
          </p>
        ) : null}
      </section>

      {data?.recent && Object.keys(data.recent).length > 0 ? (
        <section className="space-y-6" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-lg font-bold text-[var(--lms-text)]">
            Recent activity
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(data.recent).map(([section, rows]) =>
              rows.length > 0 ? (
                <div
                  key={section}
                  className="overflow-hidden rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface)]"
                >
                  <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
                    {section === "users" ? (
                      <Users className="size-4 text-[var(--lms-accent)]" aria-hidden />
                    ) : section === "courses" ? (
                      <BookOpen className="size-4 text-[var(--lms-accent)]" aria-hidden />
                    ) : (
                      <BarChart3 className="size-4 text-[var(--lms-accent)]" aria-hidden />
                    )}
                    <h3 className="text-sm font-semibold capitalize text-white">{section}</h3>
                  </div>
                  <ul className="divide-y divide-white/[0.06]">
                    {rows.slice(0, 8).map((row, idx) => (
                      <li key={idx} className="px-4 py-2.5 text-sm text-zinc-300">
                        {formatRecentRow(row)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        </section>
      ) : null}

      <p className="text-sm text-[var(--lms-text-muted)]">
        <Link href={ROUTES.ADMIN_COURSES} className="font-semibold text-[var(--lms-accent)] hover:underline">
          Manage courses →
        </Link>
      </p>
    </div>
  );
}
