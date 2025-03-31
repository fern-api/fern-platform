import { type NextRequest } from "next/server";

import { getAuth0Client } from "./app/services/auth0/auth0";

export async function middleware(req: NextRequest) {
  const auth0 = await getAuth0Client();
  const authResponse = await auth0.middleware(req);

  // copied from https://github.com/auth0/nextjs-auth0/issues/1983
  if (req.nextUrl.pathname.startsWith("/auth")) {
    if (req.nextUrl.pathname === "/auth/login") {
      // This is a workaround for this issue: https://github.com/auth0/nextjs-auth0/issues/1917
      // The auth0 middleware sets some transaction cookies that are not deleted after the login flow completes.
      // This causes stale cookies to be used in subsequent requests and eventually causes the request header to be rejected because it is too large.
      const reqCookieNames = req.cookies.getAll().map((cookie) => cookie.name);
      reqCookieNames.forEach((cookie) => {
        if (cookie.startsWith("__txn")) {
          authResponse.cookies.delete(cookie);
        }
      });
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
