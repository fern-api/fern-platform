import {
    createGetSignedUrl,
    createPutSignedUrl,
} from "@/server/createSignedUrl";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 5;

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET" && req.method !== "OPTIONS") {
        return new NextResponse(null, { status: 405 });
    }

    const corsHeaders = new Headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
    });

    if (req.method === "OPTIONS") {
        return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    const domain = req.nextUrl.hostname;
    const time: string = new Date().toISOString();
    const file = req.nextUrl.searchParams.get("file");

    if (file == null) {
        return new NextResponse(null, { status: 400 });
    }

    try {
        const key = constructS3Key(domain, time, file);
        const [put, get] = await Promise.all([
            await createPutSignedUrl(key, 60), // 1 minute
            await createGetSignedUrl(key, 60 * 5), // 5 minutes
        ]);
        corsHeaders.set("Cache-Control", "public, max-age=60");
        return NextResponse.json({ put, get }, { headers: corsHeaders });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to create signed URL", err);
        return new NextResponse(null, { status: 500, headers: corsHeaders });
    }
}

function constructS3Key(domain: string, time: string, file: string): string {
    return `${domain}/user-upload/${time}/${file}`;
}
