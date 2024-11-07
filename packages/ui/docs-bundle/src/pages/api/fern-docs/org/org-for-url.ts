import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { DocsLoader } from "@fern-ui/fern-docs-server";
import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "edge";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const domain = getDocsDomainEdge(req);

    if (!domain || typeof domain !== "string") {
        res.status(400).json({ error: "Invalid domain" });
        return;
    }

    try {
        const docsLoader = DocsLoader.create(domain);
        const metadata = await docsLoader.getMetadata();

        if (metadata) {
            res.status(200).json(metadata);
        } else {
            res.status(404).json({ error: "Org not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
