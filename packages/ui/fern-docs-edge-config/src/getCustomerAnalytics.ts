import { get } from "@vercel/edge-config";
import urlJoin from "url-join";

interface CustomerAnalytics {
    ga4?: {
        measurementId: string;
    };
    gtm?: {
        tagId: string;
    };
}

/**
 * @deprecated please migrate to docs.yml
 */
export async function getCustomerAnalytics(host: string, basePath?: string): Promise<CustomerAnalytics | undefined> {
    const config = await get<Record<string, CustomerAnalytics>>("analytics");
    return config?.[urlJoin(host, basePath ?? "")];
}
