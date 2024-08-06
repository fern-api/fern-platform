import { CustomerAnalytics } from "@fern-ui/ui";
import * as snippet from "@segment/snippet";
import { get } from "@vercel/edge-config";
import urlJoin from "url-join";

const DOMAINS_TO_SKIP = ["privategpt.docs.buildwithfern.com"];

export async function renderSegmentSnippet(domain: string): Promise<string> {
    const customerAnalytics = await getCustomerAnalytics(domain);
    const apiKey = process.env.NEXT_PUBLIC_SEGMENT_API_KEY?.trim();
    const opts = {
        apiKey: customerAnalytics?.segment?.writeKey ?? apiKey,
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

async function getCustomerAnalytics(host: string, basePath?: string): Promise<CustomerAnalytics | undefined> {
    const config = await get<Record<string, CustomerAnalytics>>("analytics");
    return config?.[urlJoin(host, basePath ?? "")];
}
