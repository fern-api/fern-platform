import { get } from "@vercel/edge-config";

export async function getCanonicalHost(host: string): Promise<string> {
    const config = await get<Record<string, string>>("canonical-host");
    const canonicalHost = config?.[host];
    return canonicalHost ?? host;
}
