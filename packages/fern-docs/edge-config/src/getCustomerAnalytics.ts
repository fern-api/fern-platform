import { get } from "@vercel/edge-config";
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
  basePath?: string
): Promise<CustomerAnalytics | undefined> {
  const config = await get<Record<string, CustomerAnalytics>>("analytics");
  return config.[urlJoin(host, basePath ?? "")];
}
