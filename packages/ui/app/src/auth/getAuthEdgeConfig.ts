import { get } from "@vercel/edge-config";
import { AuthEdgeConfig, AuthEdgeConfigSchema } from "./types";

const KEY = "authentication";

export async function getAuthEdgeConfig(currentDomain: string): Promise<AuthEdgeConfig | undefined> {
    console.log("currentDomain", currentDomain);
    const domainToTokenConfigMap = await get<Record<string, any>>(KEY);
    const toRet = domainToTokenConfigMap?.[currentDomain];

    if (toRet != null) {
        // if the config is present, it should be valid
        return AuthEdgeConfigSchema.parse(toRet);
    }

    return;
}
