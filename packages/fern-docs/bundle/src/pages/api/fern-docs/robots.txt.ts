import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getSeoDisabled } from "@fern-docs/edge-config";
import { NextRequest, NextResponse } from "next/server";
import urlJoin from "url-join";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
  const xFernHost = getDocsDomainEdge(req);
  const basePath = req.nextUrl.pathname.split("/robots.txt")[0] || "";
  const sitemap = urlJoin(
    withDefaultProtocol(xFernHost),
    basePath,
    "/sitemap.xml"
  );

  if (await getSeoDisabled(xFernHost)) {
    return new NextResponse(`User-Agent: *\nDisallow: /\nSitemap: ${sitemap}`, {
      status: 200,
    });
  }

  return new NextResponse(`User-Agent: *\nSitemap: ${sitemap}`, {
    status: 200,
  });
}
