import { DocsV2Read, FdrClient } from "@fern-api/fdr-sdk";

export const getDocs = async (url: string): Promise<DocsV2Read.LoadDocsForUrlResponse> => {
    const client = new FdrClient({
        environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    });

    const docs = await client.docs.v2.read.getDocsForUrl({ url });

    if (!docs.ok) {
        throw new Error("Failed to fetch docs");
    }

    return docs.body;
};
