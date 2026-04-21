import { refreshAccessToken } from "./auth";
import { getApiV1Base } from "./config";
import type { FieldErrors } from "./types";

export class ApiError extends Error {
  readonly status: number;

  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function joinUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${base.replace(/\/+$/, "")}/${p}`;
}

/** Unauthenticated JSON request (public list, newsletter, etc.). */
export async function publicApiRequest<T>(
  path: string,
  options: { method?: string; json?: unknown; headers?: HeadersInit } = {}
): Promise<T> {
  const { method = "GET", json, headers } = options;
  const url = joinUrl(getApiV1Base(), path);
  const hdrs = new Headers(headers);
  if (!hdrs.has("Accept")) hdrs.set("Accept", "application/json");
  let body: BodyInit | undefined;
  if (json !== undefined) {
    hdrs.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }
  const res = await fetch(url, { method, headers: hdrs, body, cache: "no-store" });
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
    throw new ApiError(humanizeApiError(res.status, data), res.status, data);
  }
  if (res.status === 204 || text === "") {
    return undefined as T;
  }
  return data as T;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("lms_access_token");
}

/** Single in-flight refresh so concurrent 401s share one token rotation. */
let refreshChain: Promise<string | null> | null = null;

function isRefreshExemptPath(path: string): boolean {
  const base = path.split("?")[0] ?? path;
  return (
    base === "refresh-token/" ||
    base.startsWith("refresh-token/") ||
    base === "login/" ||
    base.startsWith("login/")
  );
}

function refreshTokensAndReturnAccess(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!refreshChain) {
    refreshChain = (async () => {
      try {
        const rt = window.localStorage.getItem("lms_refresh_token");
        if (!rt) return null;
        const { access, refresh } = await refreshAccessToken(rt);
        window.localStorage.setItem("lms_access_token", access);
        if (refresh) window.localStorage.setItem("lms_refresh_token", refresh);
        window.dispatchEvent(new CustomEvent("lms-access-token-updated", { detail: { access } }));
        return access;
      } catch {
        window.localStorage.removeItem("lms_access_token");
        window.localStorage.removeItem("lms_refresh_token");
        window.dispatchEvent(new CustomEvent("lms-auth-cleared"));
        return null;
      } finally {
        refreshChain = null;
      }
    })();
  }
  return refreshChain;
}

export function errMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Request failed";
}

export function formatDrfErrors(body: unknown): string {
  if (!body || typeof body !== "object") return "Request failed";
  const b = body as Record<string, unknown>;
  if (typeof b.detail === "string") return b.detail;
  if (Array.isArray(b.non_field_errors) && b.non_field_errors.length) {
    return String(b.non_field_errors[0]);
  }
  const parts: string[] = [];
  for (const [k, v] of Object.entries(b)) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
    else if (typeof v === "string") parts.push(`${k}: ${v}`);
  }
  return parts.length ? parts.join("; ") : "Request failed";
}

/**
 * User-facing copy for common DRF statuses (avoids raw English permission strings in UI).
 * Raw payload stays on `ApiError.body` for debugging.
 */
export function humanizeApiError(status: number, body: unknown): string {
  const raw = formatDrfErrors(body);

  if (status === 403) {
    const low = raw.toLowerCase();
    if (
      low.includes("permission") ||
      low.includes("not allowed") ||
      low.includes("forbidden") ||
      raw === "You do not have permission to perform this action."
    ) {
      return "با نقش فعلی شما این کار مجاز نیست؛ بخش‌هایی مثل ویرایش همهٔ دوره‌ها یا تنظیم مدرس فقط برای ادمین، و برخی کارها فقط برای مدرس همان دوره است. از «یادگیری من» یا «استودیو» مطابق نقش خودتان استفاده کنید.";
    }
  }

  if (status === 401) {
    const low = raw.toLowerCase();
    if (
      low.includes("authentication") ||
      low.includes("credential") ||
      low.includes("not authenticated") ||
      low.includes("token")
    ) {
      return "نشست شما نامعتبر یا منقضی است — دوباره وارد شوید.";
    }
  }

  return raw;
}

export function parseFieldErrors(body: unknown): FieldErrors | null {
  if (!body || typeof body !== "object") return null;
  const out: FieldErrors = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (k === "detail" || k === "non_field_errors") continue;
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      out[k] = v as string[];
    }
  }
  return Object.keys(out).length ? out : null;
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  /** Relative to `/api/v1/` (e.g. `courses/` or `courses/1/`) */
  path: string;
  /** JSON body; mutually exclusive with `formData` */
  json?: unknown;
  formData?: FormData;
  token?: string | null;
  /** Skip JSON Content-Type (e.g. when sending FormData) */
  skipJsonHeaders?: boolean;
};

async function parseJsonResponse(res: Response): Promise<{ data: unknown; text: string }> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  return { data, text };
}

export async function apiRequest<T>({
  path,
  method = "GET",
  json,
  formData,
  token,
  skipJsonHeaders,
  headers,
  ...rest
}: ApiRequestOptions): Promise<T> {
  const run = async (retried: boolean): Promise<T> => {
    const url = joinUrl(getApiV1Base(), path);
    const auth = retried ? getAccessToken() : (token ?? getAccessToken());
    const hdrs = new Headers(headers);
    if (formData) {
      if (auth) hdrs.set("Authorization", `Bearer ${auth}`);
    } else {
      if (auth) hdrs.set("Authorization", `Bearer ${auth}`);
      if (!skipJsonHeaders && json !== undefined && !hdrs.has("Content-Type")) {
        hdrs.set("Content-Type", "application/json");
      }
    }

    const res = await fetch(url, {
      method,
      headers: hdrs,
      body: formData ?? (json !== undefined ? JSON.stringify(json) : undefined),
      cache: "no-store",
      ...rest,
    });

    const { data, text } = await parseJsonResponse(res);

    if (
      res.status === 401 &&
      !retried &&
      auth &&
      !isRefreshExemptPath(path) &&
      typeof window !== "undefined"
    ) {
      const newAccess = await refreshTokensAndReturnAccess();
      if (newAccess) {
        return run(true);
      }
    }

    if (!res.ok) {
      throw new ApiError(humanizeApiError(res.status, data), res.status, data);
    }

    if (res.status === 204 || text === "") {
      return undefined as T;
    }

    return data as T;
  };

  return run(false);
}
