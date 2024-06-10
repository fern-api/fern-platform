import { FdrClient, FernNavigation } from "@fern-api/fdr-sdk";

export const getRoot = async (url: string): Promise<FernNavigation.RootNode> => {
    const client = new FdrClient({
        environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    });

    const docs = await client.docs.v2.read.getDocsForUrl({ url });

    if (!docs.ok) {
        throw new Error("Failed to fetch docs");
    }

    return FernNavigation.utils.convertLoadDocsForUrlResponse(docs.body);
};
