import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { DocsLoader } from "@fern-ui/fern-docs-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<void> {
    const domain = getDocsDomainEdge(req);

    if (!domain || typeof domain !== "string") {
        return NextResponse.status(400).json({ error: "Invalid domain" });
    }

    try {
        const docsLoader = DocsLoader.create(domain);
        const metadata = await docsLoader.getMetadata();

        if (metadata) {
            return NextResponse.status(200).json(metadata);
        } else {
            return NextResponse.status(404).json({ error: "Org not found" });
        }
    } catch (error) {
        return NextResponse.status(500).json({ error: "Internal server error" });
    }
}
