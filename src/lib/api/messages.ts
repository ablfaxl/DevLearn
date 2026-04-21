import { apiRequest } from "./client";
import type { Message, MessageSendPayload, Paginated } from "./types";

const base = "messages/";

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

/** Resolve FK or nested `{ id }` from DRF serializers. */
function userIdFromRelated(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  if (isRecord(v)) {
    if (typeof v.id === "number" && Number.isFinite(v.id)) return v.id;
    if (typeof v.id === "string" && !Number.isNaN(Number(v.id))) return Number(v.id);
  }
  return NaN;
}

/**
 * Map a single API row to `Message` (handles common DRF / naming variants).
 */
export function coerceMessage(raw: unknown): Message | null {
  if (!isRecord(raw)) return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id)) return null;

  const sender =
    userIdFromRelated(raw.sender) ||
    userIdFromRelated(raw.from_user) ||
    userIdFromRelated(raw.from) ||
    0;
  const recipient =
    userIdFromRelated(raw.recipient) ||
    userIdFromRelated(raw.to_user) ||
    userIdFromRelated(raw.to) ||
    0;

  const body = String(raw.body ?? raw.content ?? raw.message ?? "").trim();
  const created_at = String(raw.created_at ?? raw.created ?? new Date().toISOString());

  let course: number | null | undefined;
  if (raw.course == null || raw.course === "") {
    course = null;
  } else if (typeof raw.course === "number") {
    course = raw.course;
  } else if (isRecord(raw.course)) {
    const cid = userIdFromRelated(raw.course);
    course = Number.isFinite(cid) ? cid : null;
  } else {
    const n = Number(raw.course);
    course = Number.isFinite(n) ? n : null;
  }

  const read = typeof raw.read === "boolean" ? raw.read : undefined;

  return {
    id,
    sender,
    recipient,
    course: course ?? null,
    body,
    read,
    created_at,
  };
}

/** Accept DRF page shape, bare arrays, or alternate keys (`data`, `messages`). */
export function normalizeMessagesList(data: unknown): Message[] {
  let items: unknown[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (isRecord(data)) {
    if (Array.isArray(data.results)) items = data.results;
    else if (Array.isArray(data.data)) items = data.data;
    else if (Array.isArray(data.messages)) items = data.messages;
  }
  const out: Message[] = [];
  for (const row of items) {
    const m = coerceMessage(row);
    if (m) out.push(m);
  }
  return out;
}

function toPaginated<T>(data: unknown, results: T[]): Paginated<T> {
  if (isRecord(data)) {
    const count = typeof data.count === "number" ? data.count : results.length;
    const next = data.next === null || typeof data.next === "string" ? data.next : null;
    const previous =
      data.previous === null || typeof data.previous === "string" ? data.previous : null;
    return { count, next, previous, results };
  }
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

export async function listMessages(params?: {
  course?: number;
  limit?: number;
  offset?: number;
}): Promise<Paginated<Message>> {
  const sp = new URLSearchParams();
  if (params?.course != null) sp.set("course", String(params.course));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  const data = await apiRequest<unknown>({ path: q ? `${base}?${q}` : base });
  const results = normalizeMessagesList(data);
  return toPaginated(data, results);
}

/** POST `/api/v1/messages/` — body `{ recipient, body, course? }` per PRD. */
export async function sendMessage(payload: MessageSendPayload): Promise<Message | null> {
  const data = await apiRequest<unknown>({ path: base, method: "POST", json: payload });
  return coerceMessage(data);
}
