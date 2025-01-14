import { redirectResponse } from "@/server/serverResponse";
import { withDeleteCookie, withSecureCookie } from "@fern-docs/auth";
import { COOKIE_FERN_DOCS_PREVIEW } from "@fern-docs/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Only allow preview in dev and preview deployments
  if (process.env.VERCEL_ENV === "production") {
    return notFound();
  }

  const host = req.nextUrl.searchParams.get("host");
  const site = req.nextUrl.searchParams.get("site");
  const clear = req.nextUrl.searchParams.get("clear");
  const cookieStore = cookies();
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

  notFound();
}
