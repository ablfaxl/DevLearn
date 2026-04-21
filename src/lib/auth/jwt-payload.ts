import { normalizeRole } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/api/types";

/**
 * Read `user_id` (or common JWT claims) from an access token payload.
 * Does not verify signature — only for UI grouping; authorization remains server-side.
 */
export function getUserIdFromAccessToken(access: string | null | undefined): number | null {
  if (!access) return null;
  try {
    const parts = access.split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = globalThis.atob(b64);
    const p = JSON.parse(json) as Record<string, unknown>;
    const v = p.user_id ?? p.userId ?? p.sub;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** `role` claim when backend embeds it in JWT (fallback until `users/me/` loads). */
export function getRoleFromAccessToken(access: string | null | undefined): UserRole | null {
  if (!access) return null;
  try {
    const parts = access.split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = globalThis.atob(b64);
    const p = JSON.parse(json) as Record<string, unknown>;
    return normalizeRole(p.role);
  } catch {
    return null;
  }
}
