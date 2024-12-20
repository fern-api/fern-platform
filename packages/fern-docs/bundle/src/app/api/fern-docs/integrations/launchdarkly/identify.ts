import { FernNextResponse } from "@/server/FernNextResponse";
import { getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { COOKIE_EMAIL } from "@fern-docs/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const email = req.nextUrl.searchParams.get(COOKIE_EMAIL);

  if (email) {
    cookies().set({ name: COOKIE_EMAIL, value: email });
  }

  return FernNextResponse.redirect(req, {
    destination: withDefaultProtocol(getHostEdge(req)),
  });
}
