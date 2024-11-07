import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { DocsLoader } from "@fern-ui/fern-docs-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<void> {
    const domain = getDocsDomainEdge(req);

    if (!domain || typeof domain !== "string") {
        return new NextResponse(JSON.stringify({ error: "Invalid domain" }), { status: 400 });
    }

    try {
        const docsLoader = DocsLoader.create(domain);
        const metadata = await docsLoader.getMetadata();

        if (metadata) {
            return new NextResponse(JSON.stringify(metadata), { status: 200 });
        } else {
            return new NextResponse(JSON.stringify({ error: "Org not found" }), { status: 404 });
        }
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
