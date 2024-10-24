import { DocsLoader } from "@fern-ui/fern-docs-server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { domain } = req.query;

    if (!domain || typeof domain !== "string") {
        res.status(400).json({ error: "Invalid domain" });
        return;
    }

    try {
        const docsLoader = DocsLoader.create(domain);
        const orgId = await docsLoader.getOrgId();

        if (orgId) {
            res.status(200).json({ orgId });
        } else {
            res.status(404).json({ error: "Org not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
