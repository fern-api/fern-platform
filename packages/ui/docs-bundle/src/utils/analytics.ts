import { type CustomerAnalytics } from "@fern-ui/ui";
import { getAll } from "@vercel/edge-config";
import urlJoin from "url-join";

export async function getCustomerAnalytics(host: string, basePath?: string): Promise<CustomerAnalytics | undefined> {
    const config = await getAll<Record<"analytics", Record<string, CustomerAnalytics>>>(["analytics"]);
    return config.analytics[urlJoin(host, basePath ?? "")];
}
