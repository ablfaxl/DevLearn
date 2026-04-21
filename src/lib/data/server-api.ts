/** Django origin for server-side `fetch` (no browser CORS). No trailing slash. */
export function getServerApiOrigin(): string {
  return (
    process.env.INTERNAL_API_BASE_URL ??
    process.env.API_PROXY_TARGET ??
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");
}

export function getServerApiV1Base(): string {
  return `${getServerApiOrigin()}/api/v1`;
}
