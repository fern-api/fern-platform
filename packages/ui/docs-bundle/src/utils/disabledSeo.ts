import { get } from "@vercel/edge-config";

export async function getSeoDisabled(host: string): Promise<boolean> {
    if (
        host.endsWith(".docs.dev.buildwithfern.com") ||
        host.endsWith(".docs.staging.buildwithfern.com") ||
        host.endsWith(".docs.buildwithfern.com")
    ) {
        return true;
    }
    const config = (await get<Array<string>>("seo-disabled")) ?? [];
    return config.includes(host);
}
