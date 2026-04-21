import type { Message } from "@/lib/api/types";

export function threadInitials(label: string): string {
  const s = label.replace(/^@/, "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[1][0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  return s.slice(0, 2).toUpperCase() || "?";
}

export function formatShortTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatThreadListTime(ts: number): string {
  if (!Number.isFinite(ts)) return "";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60_000);
  if (diffM < 1) return "now";
  if (diffM < 60) return `${diffM}m`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function dayDividerLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sod = startOfLocalDay(d);
  const today = startOfLocalDay(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = startOfLocalDay(y);
  if (sod === today) return "Today";
  if (sod === yesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export type TimelineItem =
  | { type: "day"; key: string; label: string }
  | { type: "msg"; key: string; message: Message };

/** `messages` must already be chronological (oldest first). */
export function messagesToTimeline(messages: Message[]): TimelineItem[] {
  const out: TimelineItem[] = [];
  let lastDayKey = "";
  for (const m of messages) {
    const d = new Date(m.created_at);
    const dayKey = Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dayKey && dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      out.push({ type: "day", key: `day-${dayKey}`, label: dayDividerLabel(m.created_at) });
    }
    out.push({ type: "msg", key: `m-${m.id}`, message: m });
  }
  return out;
}
