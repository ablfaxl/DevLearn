import type { NextConfig } from "next";

const proxyTarget =
  process.env.API_PROXY_TARGET?.replace(/\/+$/, "") ??
  process.env.INTERNAL_API_BASE_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:8000";

function apiMediaRemotePatterns(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}[] {
  const defaults: {
    protocol: "http" | "https";
    hostname: string;
    port?: string;
    pathname: string;
  }[] = [
    { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
    { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
    { protocol: "http", hostname: "127.0.0.1", port: "9000", pathname: "/**" },
    { protocol: "http", hostname: "localhost", port: "9000", pathname: "/**" },
  ];
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) return defaults;
  try {
    const u = new URL(raw);
    const protocol: "http" | "https" = u.protocol === "https:" ? "https" : "http";
    const entry = {
      protocol,
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/**" as const,
    };
    const dup = defaults.some(
      (d) => d.hostname === entry.hostname && (d.port ?? "") === (entry.port ?? "")
    );
    return dup ? defaults : [entry, ...defaults];
  } catch {
    return defaults;
  }
}

/**
 * Next image optimizer refuses to fetch URLs that resolve to private IPs (e.g. 127.0.0.1)
 * unless this is true — otherwise `/_next/image?url=http://127.0.0.1:9000/...` returns 400
 * `"url" parameter is not allowed"` even when `remotePatterns` matches.
 * @see https://nextjs.org/docs/app/api-reference/components/image#dangerouslyallowlocalip
 */
const dangerouslyAllowLocalIP =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_IMAGE_DANGEROUSLY_ALLOW_LOCAL_IP === "1" ||
  process.env.NEXT_IMAGE_DANGEROUSLY_ALLOW_LOCAL_IP === "true";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@heroui/react"],
  },
  images: {
    remotePatterns: apiMediaRemotePatterns(),
    dangerouslyAllowLocalIP,
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${proxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
