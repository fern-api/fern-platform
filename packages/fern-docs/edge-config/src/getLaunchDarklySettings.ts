import { withoutStaging } from "@fern-docs/utils";
import { get } from "@vercel/edge-config";
import { z } from "zod";

const LaunchDarklyEdgeConfigSchema = z.object({
  // NOTE: this is client-side visible, so we should be careful about what we expose here if we add more fields
  "client-side-id": z.string(),
  "sdk-key": z.string().optional(),

  // IMPORTANT: we will pass cookies to this endpoint, so if we move this to docs.yml,
  // we should add a check to make sure the target domain is trusted. Trust should always be granted manually by a fern engineer,
  // so it should be managed in edge config, or FGA.
  "context-endpoint": z.string().optional(),

  options: z
    .object({
      "base-url": z.string().optional(),
      "stream-url": z.string().optional(),
      "events-url": z.string().optional(),
    })
    .optional(),
});

export type LaunchDarklyEdgeConfig = z.infer<
  typeof LaunchDarklyEdgeConfigSchema
>;

export async function getLaunchDarklySettings(
  domain: string,
  orgId?: Promise<string | undefined>
): Promise<LaunchDarklyEdgeConfig | undefined> {
  const allConfigs =
    await get<Record<string, LaunchDarklyEdgeConfig>>("launchdarkly");
  const config =
    allConfigs?.[domain] ??
    allConfigs?.[withoutStaging(domain)] ??
    allConfigs?.[(await orgId) ?? ""];
  if (config) {
    const result = LaunchDarklyEdgeConfigSchema.safeParse(config);
    if (result.success) {
      return result.data;
    }
  }
  return undefined;
}
