import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { FeatureFlags } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<FeatureFlags>> {
    const domain = getDocsDomainEdge(req);
    return NextResponse.json(await getFeatureFlags(domain));
}
