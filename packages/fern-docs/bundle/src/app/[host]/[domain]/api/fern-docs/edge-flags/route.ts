import { NextRequest } from "next/server";
import { getEdgeFlags } from "@fern-docs/edge-config";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<Response> {
    const domain = getDocsDomainEdge(req);
    
    if (!domain) {
        return Response.json({ 
            error: 'Domain is required to fetch edge flags' 
        }, { status: 400 });
    }
    
    try {
        const edgeFlags = await getEdgeFlags(domain);
        
        return Response.json({
            isAskAiEnabled: edgeFlags.isAskAiEnabled,
        });
    } catch (error) {
        console.error("Error fetching edge flags:", error);
        return Response.json({ 
            error: 'Failed to fetch edge flags' 
        }, { status: 500 });
    }
}