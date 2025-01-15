import { withoutStaging } from "@fern-docs/utils";
import { get } from "@vercel/edge-config";
import { z } from "zod";

const LaunchDarklyEdgeConfigSchema = z.object({
  // NOTE: this is client-side visible, so we should be careful about what we expose here if we add more fields
  "client-side-id": z.string(),
  "context-endpoint": z.string(),
});

export type LaunchDarklyEdgeConfig = z.infer<
  typeof LaunchDarklyEdgeConfigSchema
>;

export async function getLaunchDarklySettings(
  domain: string
): Promise<LaunchDarklyEdgeConfig | undefined> {
  const allConfigs =
    await get<Record<string, LaunchDarklyEdgeConfig>>("launchdarkly");
  const config = allConfigs?.[domain] ?? allConfigs?.[withoutStaging(domain)];
  if (config) {
    const result = LaunchDarklyEdgeConfigSchema.safeParse(config);
    if (result.success) {
      return result.data;
    }
  }
  return undefined;
}
