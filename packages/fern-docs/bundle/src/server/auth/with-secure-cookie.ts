import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 *
 * @param targetUrl contains the host where the cookie will be set to (i.e. http://localhost:3000, https://xyz.vercel.app, https://x.docs.buildwithfern.com)
 * @param opts additional options for the cookie
 * @returns a new cookie with the secure, httpOnly set to true, and sameSite set to lax
 */
export function withSecureCookie(
  targetUrl: string,
  opts?: Partial<ResponseCookie>
): Partial<ResponseCookie> {
  const url = new URL(targetUrl);

  return {
    maxAge: 60 * 60 * 24 * 400, // 400 days (the maximum allowed by Chrome) — can be overridden by the caller
    path: "/",
    sameSite: "lax" as const,
    ...opts,
    secure: url.protocol === "https:",
    httpOnly: true,
    domain: url.hostname,
  };
}

export function withDeleteCookie(
  name: string,
  targetUrl: string
): Omit<ResponseCookie, "value" | "expires"> {
  const url = new URL(targetUrl);
  return {
    name,
    path: "/",
    sameSite: "lax" as const,
    secure: url.protocol === "https:",
    httpOnly: true,
    domain: url.hostname,
  };
}
