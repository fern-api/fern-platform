import { get } from "@vercel/edge-config";
import { isCustomDomain } from "./isCustomDomain";

export async function getSeoDisabled(host: string): Promise<boolean> {
    if (!isCustomDomain(host)) {
        return true;
    }
    const config = (await get<Array<string>>("seo-disabled")) ?? [];
    return config.includes(host);
}
