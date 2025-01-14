import type { InkeepSharedSettings } from "@fern-docs/search-utils";
import { withoutStaging } from "@fern-docs/utils";
import { createClient } from "@vercel/edge-config";

export async function getInkeepSettings(
  domain: string,
  edgeConfigUrl = process.env.EDGE_CONFIG
): Promise<InkeepSharedSettings | undefined> {
  try {
    const client = createClient(edgeConfigUrl);
    const config =
      await client.get<Record<string, InkeepSharedSettings>>("inkeep-enabled");
    return config?.[domain] ?? config?.[withoutStaging(domain)];
  } catch (_e) {
    return undefined;
  }
}
