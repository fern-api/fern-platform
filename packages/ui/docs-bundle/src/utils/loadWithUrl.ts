import type { DocsV2Read } from "@fern-api/fdr-sdk";

// vercel edge doesn't support lodash, which is imported from within @fern-api/fdr-sdk
export async function loadWithUrl(url: string): Promise<DocsV2Read.LoadDocsForUrlResponse | undefined> {
    const environment = process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
    if (url.includes(".docs.staging.buildwithfern.com")) {
        url = url.replace(".docs.staging.", ".docs.");
    }
    const response = await fetch(`${environment}/v2/registry/docs/load-with-url`, {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        return;
    }

    return await response.json();
}
