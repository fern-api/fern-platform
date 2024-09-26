import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { get } from "@vercel/edge-config";
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
    try {
        const config = (await get<Record<string, LaunchDarklyEdgeConfigSchema>>("launchdarkly"))?.[domain];
        if (config == null) {
            return new NextResponse(null, { status: 404 });
        }

        return NextResponse.json(config);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return new NextResponse(null, { status: 500 });
    }
}
