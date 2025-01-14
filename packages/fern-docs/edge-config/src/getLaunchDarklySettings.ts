import { withoutStaging } from "@fern-docs/utils";
import { createClient } from "@vercel/edge-config";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LaunchDarklyEdgeConfigSchema = z.object({
  // NOTE: this is client-side visible, so we should be careful about what we expose here if we add more fields
  "client-side-id": z.string().optional(),
  "user-context-endpoint": z.string().optional(),
});

export type LaunchDarklyEdgeConfig = z.infer<
  typeof LaunchDarklyEdgeConfigSchema
>;

export async function getLaunchDarklySettings(
  domain: string,
  edgeConfigUrl = process.env.EDGE_CONFIG
): Promise<LaunchDarklyEdgeConfig | undefined> {
  const client = createClient(edgeConfigUrl);
  const config =
    await client.get<Record<string, LaunchDarklyEdgeConfig>>("launchdarkly");
  return config?.[domain] ?? config?.[withoutStaging(domain)];
}
