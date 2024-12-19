import { isCustomDomain } from "@fern-docs/utils";
import { get } from "@vercel/edge-config";

export async function getSeoDisabled(host: string): Promise<boolean> {
  if (!isCustomDomain(host)) {
    return true;
  }
  const config = (await get<Array<string>>("seo-disabled")) ?? [];
  return config.includes(host);
}
