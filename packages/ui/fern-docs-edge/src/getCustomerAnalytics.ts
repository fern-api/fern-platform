import type { CustomerAnalytics } from "@fern-ui/ui";
import { get } from "@vercel/edge-config";
import urlJoin from "url-join";

/**
 * @deprecated please migrate to docs.yml
 */
export async function getCustomerAnalytics(host: string, basePath?: string): Promise<CustomerAnalytics | undefined> {
    const config = await get<Record<string, CustomerAnalytics>>("analytics");
    return config?.[urlJoin(host, basePath ?? "")];
}
