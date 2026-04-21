import { apiRequest } from "./client";
import type { Paginated, UserNotification } from "./types";

function notificationsBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_API_NOTIFICATIONS_PATH?.trim();
  if (raw) return raw.endsWith("/") ? raw : `${raw}/`;
  return "notifications/";
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

export function coerceUserNotification(raw: unknown): UserNotification | null {
  if (!isRecord(raw)) return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id)) return null;
  const title = String(raw.title ?? raw.subject ?? raw.heading ?? "Notification").trim() || "Notification";
  const body = String(raw.body ?? raw.message ?? raw.description ?? raw.text ?? "").trim();
  const created_at = String(raw.created_at ?? raw.created ?? new Date().toISOString());
  const read =
    typeof raw.read === "boolean"
      ? raw.read
      : typeof raw.is_read === "boolean"
        ? raw.is_read
        : typeof raw.seen === "boolean"
          ? raw.seen
          : undefined;
  const link =
    raw.link != null && typeof raw.link === "string"
      ? raw.link
      : raw.url != null && typeof raw.url === "string"
        ? raw.url
        : raw.action_url != null && typeof raw.action_url === "string"
          ? raw.action_url
          : null;
  const type = typeof raw.type === "string" ? raw.type : typeof raw.category === "string" ? raw.category : undefined;
  return { id, title, body, read, created_at, link, type };
}

function normalizeList(data: unknown): UserNotification[] {
  let items: unknown[] = [];
  if (Array.isArray(data)) items = data;
  else if (isRecord(data)) {
    if (Array.isArray(data.results)) items = data.results;
    else if (Array.isArray(data.data)) items = data.data;
    else if (Array.isArray(data.notifications)) items = data.notifications;
  }
  const out: UserNotification[] = [];
  for (const row of items) {
    const n = coerceUserNotification(row);
    if (n) out.push(n);
  }
  return out;
}

function toPaginated(data: unknown, results: UserNotification[]): Paginated<UserNotification> {
  if (isRecord(data)) {
    const count = typeof data.count === "number" ? data.count : results.length;
    const next = data.next === null || typeof data.next === "string" ? data.next : null;
    const previous =
      data.previous === null || typeof data.previous === "string" ? data.previous : null;
    return { count, next, previous, results };
  }
  return { count: results.length, next: null, previous: null, results };
}

export async function listNotifications(params?: { limit?: number }): Promise<Paginated<UserNotification>> {
  const base = notificationsBasePath();
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  const q = sp.toString();
  const path = q ? `${base}?${q}` : base;
  const data = await apiRequest<unknown>({ path });
  const results = normalizeList(data);
  return toPaginated(data, results);
}

/** Mark read when backend supports PATCH on the notification instance. */
export async function patchNotificationRead(id: number): Promise<boolean> {
  const base = notificationsBasePath();
  const path = `${base}${id}/`;
  try {
    await apiRequest<unknown>({ path, method: "PATCH", json: { read: true } });
    return true;
  } catch {
    try {
      await apiRequest<unknown>({ path: `${base}${id}/read/`, method: "POST", json: {} });
      return true;
    } catch {
      return false;
    }
  }
}
