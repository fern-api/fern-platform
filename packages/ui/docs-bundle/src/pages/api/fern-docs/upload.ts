import { NextRequest, NextResponse } from "next/server";
import { createGetSignedUrl, createPutSignedUrl } from "../../../utils/createSignedUrl";

export const runtime = "edge";
export const maxDuration = 5;

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
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
        return NextResponse.json({ put, get }, { headers: { "Cache-Control": "public, max-age=60" } });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to create signed URL", err);
        return new NextResponse(null, { status: 500 });
    }
}

function constructS3Key(domain: string, time: string, file: string): string {
    return `${domain}/user-upload/${time}/${file}`;
}
