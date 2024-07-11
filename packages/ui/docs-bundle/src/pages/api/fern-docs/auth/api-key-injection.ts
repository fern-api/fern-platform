// eslint-disable-next-line import/no-internal-modules
import { APIKeyInjectionConfig, getAPIKeyInjectionConfig, withSecureCookie } from "@fern-ui/ui/auth";
import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../../utils/xFernHost";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<APIKeyInjectionConfig>> {
    const domain = getXFernHostEdge(req);
    const fern_token = req.cookies.get("fern_token")?.value;
    if (fern_token == null) {
        const response = NextResponse.json({ enabled: false as const });
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");
        return response;
    }

    const config = await getAPIKeyInjectionConfig(domain, req.cookies);
    const response = NextResponse.json(config);

    if (config.enabled && config.authenticated) {
        const expires = new Date(config.exp * 1000);
        response.cookies.set("fern_token", fern_token, withSecureCookie({ expires }));
        response.cookies.set("access_token", config.access_token, withSecureCookie({ expires }));
        if (config.refresh_token != null) {
            response.cookies.set("refresh_token", config.refresh_token, withSecureCookie({ expires }));
        }
    }
    return response;
}
