import { apiRequest } from "./client";
import type { AdminOverviewResponse } from "./types";

const path = "admin/overview/";

function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

/** Coerce unknown API JSON into a stable dashboard shape. */
export function coerceAdminOverview(raw: unknown): AdminOverviewResponse {
  if (!isRecord(raw)) return { counts: {}, recent: {} };
  const counts: Record<string, number> = {};
  const c = raw.counts;
  if (isRecord(c)) {
    for (const [k, v] of Object.entries(c)) {
      if (typeof v === "number" && Number.isFinite(v)) counts[k] = v;
      else if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) counts[k] = Number(v);
    }
  }
  const recent: AdminOverviewResponse["recent"] = {};
  const r = raw.recent;
  if (isRecord(r)) {
    for (const [key, val] of Object.entries(r)) {
      if (Array.isArray(val)) recent[key] = val.filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x));
    }
  }
  return { counts, recent };
}

/** `GET /api/v1/admin/overview/` — platform admin JWT only (403 otherwise). */
export async function getAdminOverview(): Promise<AdminOverviewResponse> {
  const data = await apiRequest<unknown>({ path });
  return coerceAdminOverview(data);
}
