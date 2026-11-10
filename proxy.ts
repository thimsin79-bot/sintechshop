import { NextResponse, type NextRequest } from "next/server";

function getUpstreamOrigin(): string | null {
  try {
    return new URL(process.env.NEON_AUTH_BASE_URL ?? "").origin;
  } catch {
    return null;
  }
}

function isTrustedOrigin(request: NextRequest, origin: string): boolean {
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const candidates = new Set<string>();

  try {
    candidates.add(new URL(request.url).origin);
  } catch {
    // Ignore malformed request URLs.
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    candidates.add(`${proto}://${host}`);
    candidates.add(`https://${host}`);
    candidates.add(`http://${host}`);
  }

  for (const key of [
    "VERCEL_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  ]) {
    const value = process.env[key];
    if (!value) continue;
    candidates.add(value.includes("://") ? value : `https://${value}`);
  }

  for (const value of (process.env.AUTH_TRUSTED_ORIGINS ?? "").split(",")) {
    const trimmed = value.trim();
    if (trimmed) candidates.add(trimmed);
  }

  for (const candidate of candidates) {
    try {
      if (new URL(candidate).host === originUrl.host) return true;
    } catch {
      // Ignore invalid configured origins.
    }
  }

  return false;
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return NextResponse.next();

  const upstreamOrigin = getUpstreamOrigin();
  if (!upstreamOrigin || upstreamOrigin === origin) return NextResponse.next();
  if (!isTrustedOrigin(request, origin)) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("origin", upstreamOrigin);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/api/auth/:path*",
};
