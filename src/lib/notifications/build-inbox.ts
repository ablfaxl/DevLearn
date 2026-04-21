import { ROUTES } from "@/constants";
import type { UserNotification } from "@/lib/api/types";

export type InboxNotification = {
  key: string;
  title: string;
  body: string;
  createdAt: string;
  /** Effective read / cleared state for UI */
  cleared: boolean;
  href: string | null;
  source: "server" | "messages";
  serverId: number | null;
};

export function buildInboxNotifications(
  server: UserNotification[],
  unreadDirectMessages: number,
  dismissed: Set<string>
): InboxNotification[] {
  const out: InboxNotification[] = [];

  if (unreadDirectMessages > 0) {
    const key = "synthetic:unread-messages";
    const cleared = dismissed.has(key);
    out.push({
      key,
      title: "Unread messages",
      body:
        unreadDirectMessages === 1
          ? "You have 1 unread direct message."
          : `You have ${unreadDirectMessages} unread direct messages.`,
      createdAt: new Date().toISOString(),
      cleared,
      href: ROUTES.MESSAGES,
      source: "messages",
      serverId: null,
    });
  }

  for (const n of server) {
    const key = `server:${n.id}`;
    const cleared = dismissed.has(key) || n.read === true;
    const href = n.link?.trim() || null;
    out.push({
      key,
      title: n.title,
      body: n.body || "—",
      createdAt: n.created_at,
      cleared,
      href,
      source: "server",
      serverId: n.id,
    });
  }

  out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return out;
}

export function unreadInboxCount(items: InboxNotification[]): number {
  return items.filter((i) => !i.cleared).length;
}
