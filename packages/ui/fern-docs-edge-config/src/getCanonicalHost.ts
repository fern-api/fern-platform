import { isCustomDomain } from "@fern-ui/fern-docs-utils";
import { get } from "@vercel/edge-config";

export async function getCanonicalHost(host: string): Promise<string> {
    if (!isCustomDomain(host)) {
        const config = await get<Record<string, string>>("canonical-host");
        const canonicalHost = config?.[host];
        return canonicalHost ?? host;
    }
    return host;
}
