import { verifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge";
import { COOKIE_EMAIL, COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { get } from "@vercel/edge-config";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const LaunchDarklyEdgeConfigSchema = z.object({
    // NOTE: this is client-side visible, so we should be careful about what we expose here if we add more fields
    "client-side-id": z.string().optional(),
});

type LaunchDarklyEdgeConfigSchema = z.infer<typeof LaunchDarklyEdgeConfigSchema>;

export default async function handler(req: NextRequest): Promise<NextResponse<LaunchDarklyEdgeConfigSchema>> {
    const domain = getXFernHostEdge(req);
    const jar = cookies();
    let email = jar.get(COOKIE_EMAIL)?.value;
    const fernToken = jar.get(COOKIE_FERN_TOKEN)?.value;

    if (fernToken && !email) {
        try {
            const user = await verifyFernJWTConfig(fernToken, await getAuthEdgeConfig(domain));
            email = user.email;
        } catch (e) {
            // do nothing
        }
    }

    try {
        const config = (await get<Record<string, LaunchDarklyEdgeConfigSchema>>("launchdarkly"))?.[domain];
        if (config == null) {
            return NextResponse.json({}, { status: 404 });
        }

        return NextResponse.json(config);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return NextResponse.json({}, { status: 500 });
    }
}
