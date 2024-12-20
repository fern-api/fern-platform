import { withoutStaging } from "@fern-ui/fern-docs-utils";
import type { InkeepSharedSettings } from "@fern-ui/search-utils";
import { get } from "@vercel/edge-config";

export async function getInkeepSettings(domain: string): Promise<InkeepSharedSettings | undefined> {
    try {
        const config = await get<Record<string, InkeepSharedSettings>>("inkeep-enabled");
        return config?.[domain] ?? config?.[withoutStaging(domain)];
    } catch (_e) {
        return undefined;
    }
}
