"use client";

import { ROUTES } from "@/constants";
import { useAdminAuth } from "@/features/auth";
import { useNotificationsOptional } from "@/features/notifications";
import type { InboxNotification } from "@/lib/notifications/build-inbox";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function openHref(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    window.open(href, "_blank", "noopener,noreferrer");
  } else {
    router.push(href);
  }
}

type Props = {
  /** Extra classes for the round trigger button */
  className?: string;
};

export function NotificationsBell({ className }: Props) {
  const { accessToken } = useAdminAuth();
  const ctx = useNotificationsOptional();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  /**
   * Refresh after open — use a ref so we don’t re-run when `ctx` identity changes (provider updates loading).
   * Never call refresh inside `setOpen` (updates parent during child state update).
   */
  useEffect(() => {
    if (!open) return;
    void ctxRef.current?.refresh();
  }, [open]);

  const toggleOpen = useCallback(() => {
    setOpen((o) => !o);
  }, []);

  const handleItemActivate = useCallback(
    async (item: InboxNotification) => {
      if (item.href) openHref(item.href, router);
      if (!item.cleared) await ctx?.markCleared(item);
      setOpen(false);
    },
    [ctx, router]
  );

  if (!accessToken || !ctx) return null;

  const { unreadCount, items, loading, error } = ctx;
  const preview = items.slice(0, 8);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={
          className ??
          "relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--lms-surface)] text-zinc-400 transition hover:text-white sm:size-10"
        }
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute end-0 top-0 flex size-4 translate-x-0.5 -translate-y-0.5 items-center justify-center rounded-full bg-[var(--lms-accent)] text-[10px] font-bold text-[#1a0f08]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute end-0 z-[60] mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-white/[0.1] bg-[var(--lms-surface)] shadow-2xl"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {loading ? <Loader2 className="size-4 animate-spin text-zinc-500" aria-hidden /> : null}
          </div>
          {error ? <p className="px-3 py-2 text-xs text-amber-300">{error}</p> : null}
          <ul className="max-h-80 overflow-y-auto overscroll-contain">
            {preview.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500">You&apos;re all caught up.</li>
            ) : (
              preview.map((item) => (
                <li key={item.key} className="border-b border-white/[0.06] last:border-0">
                  <button
                    type="button"
                    onClick={() => void handleItemActivate(item)}
                    className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-start transition hover:bg-white/[0.04] ${
                      item.cleared ? "opacity-60" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-white">{item.title}</span>
                    <span className="line-clamp-2 text-xs text-zinc-500">{item.body}</span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-white/[0.08] px-2 py-2">
            <Link
              href={ROUTES.NOTIFICATIONS}
              className="block rounded-lg px-2 py-2 text-center text-sm font-semibold text-[var(--lms-accent)] hover:bg-white/[0.04]"
              onClick={() => setOpen(false)}
            >
              See all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
