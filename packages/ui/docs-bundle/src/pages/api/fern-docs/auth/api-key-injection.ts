// eslint-disable-next-line import/no-internal-modules
import { getOAuthEdgeConfig } from "@fern-ui/ui/auth";
import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../../utils/xFernHost";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<string | false>> {
    const domain = getXFernHostEdge(req);
    const config = await getOAuthEdgeConfig(domain);

    // ory is the only partner enabled for api-key-injection (with RightBrain)
    if (config?.["api-key-injection-enabled"] && config.partner === "ory") {
        const url = new URL("/auth", config.environment);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", config.clientId);
        url.searchParams.set("scope", "offline_access");
        return NextResponse.json(url.toString());
    }

    return NextResponse.json(false);
}
