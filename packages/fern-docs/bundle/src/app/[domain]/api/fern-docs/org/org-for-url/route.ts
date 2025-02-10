import { NextRequest, NextResponse } from "next/server";

import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

export interface DocsMetadata {
  orgId: string;
  isPreviewUrl: boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const metadata = await getOrgMetadataForDomain(domain);

  if (metadata) {
    return NextResponse.json(metadata, { status: 200 });
  } else {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }
}
