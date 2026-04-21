import type { Course, Message } from "@/lib/api/types";

export const THREAD_KEY_SEP = "\u0001";

export function makeThreadKey(courseId: number | null, peerUserId: number): string {
  return `${courseId ?? 0}${THREAD_KEY_SEP}${peerUserId}`;
}

export function parseThreadKey(key: string): { courseId: number | null; peerUserId: number } {
  const i = key.indexOf(THREAD_KEY_SEP);
  if (i < 0) return { courseId: null, peerUserId: NaN };
  const c = Number(key.slice(0, i));
  const peer = Number(key.slice(i + THREAD_KEY_SEP.length));
  return { courseId: c === 0 ? null : c, peerUserId: peer };
}

/** Other party in a 1:1 message; if `me` is unknown, prefers `recipient` then `sender`. */
export function resolvePeer(m: Message, me: number | null): number {
  if (me != null) {
    if (m.sender === me) return m.recipient;
    if (m.recipient === me) return m.sender;
  }
  if (m.recipient > 0) return m.recipient;
  return m.sender;
}

function sortAsc(a: Message, b: Message): number {
  const ta = Date.parse(a.created_at);
  const tb = Date.parse(b.created_at);
  if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return ta - tb;
  return a.id - b.id;
}

export type ChatThread = {
  key: string;
  courseId: number | null;
  peerUserId: number;
  courseTitle: string;
  peerLabel: string;
  messages: Message[];
  lastAt: number;
  lastPreview: string;
};

export function labelsForThread(
  courseId: number | null,
  peerUserId: number,
  courseById: Map<number, Course>
): { courseTitle: string; peerLabel: string } {
  const course = courseId != null ? courseById.get(courseId) : undefined;
  const courseTitle = course?.title ?? (courseId ? `دوره ${courseId}` : "بدون درس");
  const peerLabel =
    course && course.instructor === peerUserId
      ? course.instructor_detail?.username
        ? `@${course.instructor_detail.username}`
        : "مدرس دوره"
      : `کاربر #${peerUserId}`;
  return { courseTitle, peerLabel };
}

export function messagesToThreads(
  messages: Message[],
  me: number | null,
  courseById: Map<number, Course>
): ChatThread[] {
  const grouped = new Map<string, Message[]>();
  for (const m of messages) {
    const peer = resolvePeer(m, me);
    const key = makeThreadKey(m.course ?? null, peer);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(m);
  }
  const out: ChatThread[] = [];
  for (const [key, msgs] of grouped) {
    const sorted = [...msgs].sort(sortAsc);
    const last = sorted[sorted.length - 1];
    const { courseId, peerUserId } = parseThreadKey(key);
    const { courseTitle, peerLabel } = labelsForThread(courseId, peerUserId, courseById);
    const lastAt = Date.parse(last.created_at);
    const body = last.body ?? "";
    out.push({
      key,
      courseId,
      peerUserId,
      courseTitle,
      peerLabel,
      messages: sorted,
      lastAt: Number.isFinite(lastAt) ? lastAt : last.id,
      lastPreview: body.length > 72 ? `${body.slice(0, 72)}…` : body || "—",
    });
  }
  out.sort((a, b) => b.lastAt - a.lastAt);
  return out;
}

export type ThreadDraft = { key: string; courseId: number | null; peerUserId: number };

export function mergeDraftThreads(
  messageThreads: ChatThread[],
  drafts: ThreadDraft[],
  courseById: Map<number, Course>
): ChatThread[] {
  const map = new Map(messageThreads.map((t) => [t.key, t]));
  for (const d of drafts) {
    if (map.has(d.key)) continue;
    const { courseTitle, peerLabel } = labelsForThread(d.courseId, d.peerUserId, courseById);
    map.set(d.key, {
      key: d.key,
      courseId: d.courseId,
      peerUserId: d.peerUserId,
      courseTitle,
      peerLabel,
      messages: [],
      lastAt: Date.now(),
      lastPreview: "گفتگوی جدید",
    });
  }
  return [...map.values()].sort((a, b) => b.lastAt - a.lastAt);
}

export function threadForKey(
  threads: ChatThread[],
  key: string | null
): ChatThread | undefined {
  if (!key) return undefined;
  return threads.find((t) => t.key === key);
}
