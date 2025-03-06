import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@vercel/functions";

import { COOKIE_FERN_DOCS_PREVIEW } from "@fern-docs/utils";

import {
  withDeleteCookie,
  withSecureCookie,
} from "@/server/auth/with-secure-cookie";
import { redirectResponse } from "@/server/serverResponse";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { VERCEL_ENV } = getEnv();

  // Only allow preview in dev and preview deployments, or if the hostname is canary.ferndocs.com
  if (
    VERCEL_ENV === "production" &&
    req.nextUrl.hostname !== "canary.ferndocs.com"
  ) {
    console.debug(
      "Blocking preview request in production for hostname:",
      req.nextUrl.hostname
    );
    return notFound();
  }

  const host = req.nextUrl.searchParams.get("host");
  const site = req.nextUrl.searchParams.get("site");
  const clear = req.nextUrl.searchParams.get("clear");
  const cookieStore = await cookies();
  if (typeof host === "string") {
    cookieStore.set(
      COOKIE_FERN_DOCS_PREVIEW,
      host,
      withSecureCookie(req.nextUrl.origin)
    );
    return redirectResponse(req.nextUrl.origin);
  } else if (typeof site === "string") {
    cookieStore.set(
      COOKIE_FERN_DOCS_PREVIEW,
      `${site}.docs.buildwithfern.com`,
      withSecureCookie(req.nextUrl.origin)
    );
    return redirectResponse(req.nextUrl.origin);
  } else if (clear === "true") {
    cookieStore.delete(
      withDeleteCookie(COOKIE_FERN_DOCS_PREVIEW, req.nextUrl.origin)
    );
    return redirectResponse(req.nextUrl.origin);
  }

  console.debug("Rejecting preview request - missing or invalid parameters");
  notFound();
}
