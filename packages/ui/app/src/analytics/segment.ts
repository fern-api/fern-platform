import * as snippet from "@segment/snippet";

const DOMAINS_TO_SKIP = ["privategpt.docs.buildwithfern.com"];

export async function renderSegmentSnippet(domain: string, customSegmentWriteKey?: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_SEGMENT_API_KEY?.trim();
    const opts = {
        apiKey: customSegmentWriteKey ?? apiKey,
        page: true,
    };
    // Skip rendering the snippet for certain domains
    if (DOMAINS_TO_SKIP.includes(domain) || !opts.apiKey) {
        return "";
    }
    if (process.env.NODE_ENV === "development") {
        return snippet.max(opts);
    }
    return snippet.min(opts);
}
