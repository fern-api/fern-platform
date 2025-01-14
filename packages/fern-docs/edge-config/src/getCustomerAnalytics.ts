import { createClient } from "@vercel/edge-config";
import urlJoin from "url-join";

interface GTMParams {
  tagId: string;
}
interface CustomerAnalytics {
  ga4?: {
    measurementId: string;
  };
  gtm?: GTMParams;
}

// deprecated
export async function getCustomerAnalytics(
  host: string,
  basePath?: string,
  edgeConfigUrl = process.env.EDGE_CONFIG
): Promise<CustomerAnalytics | undefined> {
  const client = createClient(edgeConfigUrl);
  const config =
    await client.get<Record<string, CustomerAnalytics>>("analytics");
  return config?.[urlJoin(host, basePath ?? "")];
}
