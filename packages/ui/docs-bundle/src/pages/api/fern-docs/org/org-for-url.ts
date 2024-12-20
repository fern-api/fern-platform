import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export interface DocsMetadata {
    orgId: string;
    isPreviewUrl: boolean;
}

export default async function handler(req: NextRequest): Promise<NextResponse<DocsMetadata>> {
    const domain = getDocsDomainEdge(req);

    if (!domain || typeof domain !== "string") {
        return new NextResponse(JSON.stringify({ error: "Invalid domain" }), { status: 400 });
    }

    const metadata = await getOrgMetadataForDomain(domain);

    if (metadata) {
        return new NextResponse(JSON.stringify(metadata), { status: 200 });
    } else {
        return new NextResponse(JSON.stringify({ error: "Org not found" }), { status: 404 });
    }
}
