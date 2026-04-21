/**
 * When true, browser calls same-origin `/api-backend/...` (see `next.config.ts` rewrites) to avoid CORS during local dev.
 * Set in `.env`: `NEXT_PUBLIC_API_USE_PROXY=true`
 */
export function usesApiProxy(): boolean {
  const v = process.env.NEXT_PUBLIC_API_USE_PROXY?.toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Django API origin (no trailing slash), e.g. http://127.0.0.1:8000 — used when not using the dev proxy.
 */
export function getApiOrigin(): string {
  if (usesApiProxy()) {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  }
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
  return raw.replace(/\/+$/, "");
}

/** Human-readable line for the admin shell footer */
export function getApiConnectionHint(): string {
  if (usesApiProxy()) {
    return "Browser → /api-backend/* (Next rewrite to Django)";
  }
  return getApiOrigin() || "Not configured";
}

/** Base for LMS course API (`…/api/v1`) */
export function getApiV1Base(): string {
  if (usesApiProxy()) {
    return "/api-backend/api/v1";
  }
  return `${getApiOrigin()}/api/v1`;
}

/**
 * HTTP origin used to derive WebSocket origin when `NEXT_PUBLIC_WS_URL` is unset.
 * Prefer `NEXT_PUBLIC_API_BASE_URL` so WS can reach Django while HTTP uses the Next proxy.
 */
function getHttpOriginForWs(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (typeof window !== "undefined" && !usesApiProxy()) {
    return getApiOrigin();
  }
  return "http://127.0.0.1:8000";
}

/**
 * WebSocket origin (no path), e.g. `ws://127.0.0.1:8000`.
 * Set **`NEXT_PUBLIC_WS_URL`** when HTTP goes through Next proxy but WS must hit Django directly.
 */
export function getWsOrigin(): string {
  const wsEnv = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (wsEnv) return wsEnv.replace(/\/+$/, "");
  const http = getHttpOriginForWs();
  return http.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
}

/** Django Channels: `ws(s)://<host>/ws/chat/?token=<access_jwt>` */
export function getWsChatUrl(accessToken: string): string {
  const origin = getWsOrigin();
  const enc = encodeURIComponent(accessToken);
  return `${origin}/ws/chat/?token=${enc}`;
}

/**
 * Relative path under `/api/v1/` for registration POST (no leading/trailing slashes).
 * Default `auth/register/`; set to `register/` if Django exposes only `POST /register/`.
 */
export function getRegisterPath(): string {
  const p = process.env.NEXT_PUBLIC_API_REGISTER_PATH?.trim();
  if (!p) return "auth/register/";
  return p.replace(/^\/+/, "").replace(/\/+$/, "");
}

/** Relative GET path under `/api/v1/` for current user profile (trailing slash). */
export function getMePath(): string {
  const p = process.env.NEXT_PUBLIC_API_ME_PATH?.trim();
  if (!p) return "me/";
  const normalized = p.replace(/^\/+/, "").replace(/\/+$/, "");
  return `${normalized}/`;
}

/** Django admin UI base (no trailing slash), e.g. `http://127.0.0.1:8000/admin`. */
export function getDjangoAdminUrl(): string {
  const env = process.env.NEXT_PUBLIC_DJANGO_ADMIN_URL?.trim();
  if (env) return env.replace(/\/+$/, "");
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://127.0.0.1:8000";
  return `${base}/admin`;
}

/**
 * JWT / session login URL.
 * Override with `NEXT_PUBLIC_API_TOKEN_URL` (full URL or path from site origin when proxying).
 */
export function getTokenUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_TOKEN_URL?.trim();
  if (!configured) {
    if (usesApiProxy()) {
      return "/api-backend/api/v1/login/";
    }
    return `${getApiOrigin()}/api/v1/login/`;
  }
  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return configured.replace(/\/+$/, "");
  }
  const path = configured.startsWith("/") ? configured : `/${configured}`;
  const normalized = path.replace(/\/+$/, "");
  if (usesApiProxy() && normalized.startsWith("/api/v1/")) {
    return `/api-backend${normalized}`;
  }
  if (usesApiProxy()) {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
  return `${getApiOrigin()}${normalized}`;
}
