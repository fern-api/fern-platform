import { get } from "@vercel/edge-config";

import type { InkeepSharedSettings } from "@fern-docs/search-utils";
import { withoutStaging } from "@fern-docs/utils";

export async function getInkeepSettings(
  domain: string
): Promise<InkeepSharedSettings | undefined> {
  try {
    const config =
      await get<Record<string, InkeepSharedSettings>>("inkeep-enabled");
    return config.[domain] ?? config.[withoutStaging(domain)];
  } catch (_e) {
    return undefined;
  }
}
