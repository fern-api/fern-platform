import { AuthEdgeConfigSchema, type AuthEdgeConfig } from "@fern-docs/auth";
import { withoutStaging } from "@fern-docs/utils";
import { get } from "@vercel/edge-config";

const KEY = "authentication";

export async function getAuthEdgeConfig(
  currentDomain: string
): Promise<AuthEdgeConfig | undefined> {
  const domainToTokenConfigMap = await get<Record<string, any>>(KEY);
  const toRet =
    domainToTokenConfigMap?.[currentDomain] ??
    domainToTokenConfigMap?.[withoutStaging(currentDomain)];

  if (toRet != null) {
    const config = AuthEdgeConfigSchema.safeParse(toRet);

    // if the config is present, it should be valid.
    // if it's malformed, custom auth for this domain will not work and may leak docs to the public.
    if (!config.success) {
      // eslint-disable-next-line no-console
      console.error(
        `Could not parse AuthEdgeConfigSchema for ${currentDomain}`,
        config.error
      );
      // TODO: sentry
    }

    return config.data;
  }

  return;
}
