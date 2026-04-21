"use client";

import { useAdminAuth } from "@/features/auth";
import { ApiError, getAccessToken } from "@/lib/api/client";
import { listMessages } from "@/lib/api/messages";
import { listNotifications, patchNotificationRead } from "@/lib/api/notifications";
import type { UserNotification } from "@/lib/api/types";
import { getUserIdFromAccessToken } from "@/lib/auth/jwt-payload";
import { buildInboxNotifications, unreadInboxCount, type InboxNotification } from "@/lib/notifications/build-inbox";
import {
  clearDismissedNotificationKey,
  dismissNotificationKey,
  getDismissedNotificationKeys,
} from "@/lib/notifications/dismissed-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type NotificationsContextValue = {
  items: InboxNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markCleared: (item: InboxNotification) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, bootstrapped } = useAdminAuth();
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const token = typeof window !== "undefined" ? getAccessToken() : null;
    if (!token) {
      setItems([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    let dismissed = getDismissedNotificationKeys();

    let serverList: UserNotification[] = [];
    try {
      const page = await listNotifications({ limit: 50 });
      serverList = page.results ?? [];
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        serverList = [];
      } else if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("Could not load notifications.");
      }
    }

    let unreadDm = 0;
    const me = getUserIdFromAccessToken(token);
    if (me != null) {
      try {
        const msgs = await listMessages({ limit: 120 });
        for (const m of msgs.results ?? []) {
          if (m.recipient === me && m.read !== true) unreadDm += 1;
        }
      } catch {
        /* messages optional */
      }
    }

    /** No unread DMs → drop synthetic row and clear local dismiss so future unreads show again. */
    if (unreadDm === 0) {
      clearDismissedNotificationKey("synthetic:unread-messages");
      dismissed = getDismissedNotificationKeys();
    }

    const merged = buildInboxNotifications(serverList, unreadDm, dismissed);
    setItems(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    void refresh();
  }, [bootstrapped, accessToken, refresh]);

  useEffect(() => {
    if (!bootstrapped || !accessToken) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 90_000);
    return () => window.clearInterval(id);
  }, [bootstrapped, accessToken, refresh]);

  const markCleared = useCallback(
    async (item: InboxNotification) => {
      if (item.source === "server" && item.serverId != null) {
        const ok = await patchNotificationRead(item.serverId);
        if (!ok) dismissNotificationKey(item.key);
      } else {
        dismissNotificationKey(item.key);
      }
      await refresh();
    },
    [refresh]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unreadCount: unreadInboxCount(items),
      loading,
      error,
      refresh,
      markCleared,
    }),
    [items, loading, error, refresh, markCleared]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}

/** Safe for optional UI (e.g. marketing pages) without provider — returns null when absent. */
export function useNotificationsOptional(): NotificationsContextValue | null {
  return useContext(NotificationsContext);
}
