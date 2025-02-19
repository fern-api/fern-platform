import { NextRequest, NextResponse } from "next/server";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

export interface DocsMetadata {
  orgId: string;
  isPreviewUrl: boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const host = getHostEdge(req);
  const domain = getDocsDomainEdge(req);

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const loader = await createCachedDocsLoader(host, domain);
  const metadata = await loader.getMetadata();

  if (metadata) {
    return NextResponse.json(metadata, { status: 200 });
  } else {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }
}
