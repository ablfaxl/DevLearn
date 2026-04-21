import { getApiV1Base, getRegisterPath, getTokenUrl } from "./config";
import type { RegisterPayload } from "./types";

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface RefreshResult {
  access: string;
  /** Some backends rotate refresh tokens. */
  refresh?: string;
}

/**
 * POST `/api/v1/refresh-token/` with `{ refresh }` (SimpleJWT-style).
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshResult> {
  const base = getApiV1Base().replace(/\/+$/, "");
  const url = `${base}/refresh-token/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `Token refresh failed (${res.status})`;
    throw new Error(msg);
  }
  const d = data as Partial<RefreshResult>;
  if (!d.access) {
    throw new Error("Unexpected refresh response (missing access)");
  }
  return { access: d.access, refresh: d.refresh };
}

/**
 * Sign up — default `POST …/api/v1/auth/register/`; override with `NEXT_PUBLIC_API_REGISTER_PATH` (e.g. `register/`).
 * Backend may return user only or tokens — adjust when wiring Django.
 */
export async function registerUser(payload: RegisterPayload): Promise<unknown> {
  const base = getApiV1Base().replace(/\/+$/, "");
  const url = `${base}/${getRegisterPath()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `Registration failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Obtain JWT pair. Django SimpleJWT typically expects `{ username, password }`.
 */
export async function obtainTokenPair(username: string, password: string): Promise<TokenPair> {
  const res = await fetch(getTokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `Login failed (${res.status})`;
    throw new Error(msg);
  }
  const d = data as Partial<TokenPair>;
  if (!d.access || !d.refresh) {
    throw new Error("Unexpected token response (missing access/refresh)");
  }
  return { access: d.access, refresh: d.refresh };
}
