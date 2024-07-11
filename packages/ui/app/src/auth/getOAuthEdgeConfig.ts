import { get } from "@vercel/edge-config";
import { OAuthEdgeConfig, OAuthEdgeConfigSchema } from "./types";

const KEY = "authentication";

export async function getOAuthEdgeConfig(currentDomain: string): Promise<OAuthEdgeConfig | undefined> {
    const domainToTokenConfigMap = await get<Record<string, any>>(KEY);
    const toRet = domainToTokenConfigMap?.[currentDomain];

    if (toRet != null) {
        const parsed = OAuthEdgeConfigSchema.safeParse(toRet);
        if (parsed.success) {
            return parsed.data;
        }
    }

    return;
}
