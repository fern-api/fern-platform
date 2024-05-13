import * as snippet from "@segment/snippet";
const DOMAINS_TO_SKIP = ["privategpt.docs.buildwithfern.com"];

export function renderSegmentSnippet(domain: string): string {
    const opts = {
        apiKey: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
        page: true,
    };
    // Skip rendering the snippet for certain domains
    if (DOMAINS_TO_SKIP.includes(domain)) {
        return "";
    }
    if (process.env.NODE_ENV === "development") {
        return snippet.max(opts);
    }
    return snippet.min(opts);
}
