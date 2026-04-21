"use client";

import { ROUTES } from "@/constants";
import { useNotifications } from "@/features/notifications";
import type { InboxNotification } from "@/lib/notifications/build-inbox";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

function openHref(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    window.open(href, "_blank", "noopener,noreferrer");
  } else {
    router.push(href);
  }
}

export function NotificationsPageContent() {
  const { items, unreadCount, loading, error, refresh, markCleared } = useNotifications();
  const router = useRouter();

  const onOpen = useCallback(
    (item: InboxNotification) => {
      if (item.href) openHref(item.href, router);
    },
    [router]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Alerts from your school and unread message summaries.{" "}
            {unreadCount > 0 ? (
              <span className="text-[var(--lms-accent)]">{unreadCount} need attention.</span>
            ) : (
              <span>Nothing pending.</span>
            )}
          </p>
        </div>
        <Button size="sm" variant="outline" className="border-white/15" onPress={() => void refresh()} isDisabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          {error}
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-[var(--lms-surface)]">
        {items.length === 0 && !loading ? (
          <li className="px-4 py-12 text-center text-sm text-zinc-500">
            No notifications yet. When your API exposes{" "}
            <code className="rounded bg-black/40 px-1 text-xs">GET /api/v1/notifications/</code>, they will appear
            here. Unread direct messages are summarized automatically.
          </li>
        ) : (
          items.map((item) => (
            <li key={item.key} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className={`min-w-0 flex-1 ${item.cleared ? "opacity-60" : ""}`}>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{item.body}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {item.href ? (
                  <Button size="sm" variant="outline" className="border-white/15" onPress={() => onOpen(item)}>
                    Open
                  </Button>
                ) : null}
                {!item.cleared ? (
                  <Button
                    size="sm"
                    className="bg-[var(--lms-accent)] font-semibold text-[#1a0f08]"
                    onPress={() => void markCleared(item)}
                  >
                    Mark read
                  </Button>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="mt-8 text-center text-sm">
        <Link href={ROUTES.HOME} className="text-[var(--lms-accent)] hover:underline">
          ← Home
        </Link>
      </p>
    </div>
  );
}
