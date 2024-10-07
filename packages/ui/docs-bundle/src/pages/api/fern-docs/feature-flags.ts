import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { getFeatureFlags } from "@fern-ui/fern-docs-edge";
import { FeatureFlags } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<FeatureFlags>> {
    const domain = getXFernHostEdge(req);
    return NextResponse.json(await getFeatureFlags(domain));
}
