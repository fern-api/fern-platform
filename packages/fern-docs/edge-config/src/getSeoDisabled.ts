import { isCustomDomain } from "@fern-docs/utils";
import { createClient } from "@vercel/edge-config";

export async function getSeoDisabled(
  host: string,
  edgeConfigUrl = process.env.EDGE_CONFIG
): Promise<boolean> {
  if (!isCustomDomain(host)) {
    return true;
  }
  const client = createClient(edgeConfigUrl);
  const config = (await client.get<string[]>("seo-disabled")) ?? [];
  return config.includes(host);
}
