import { apiRequest } from "./client";
import { getMePath } from "./config";
import type { UserProfile } from "./types";

/** Authenticated profile — default `GET /api/v1/me/`. */
export function getCurrentUserProfile() {
  return apiRequest<UserProfile>({ path: getMePath() });
}

export function userDisplayLabel(u: UserProfile): string {
  const full = u.full_name?.trim() || u.name?.trim();
  if (full) return full;
  const combined = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  if (combined) return combined;
  return u.username;
}
