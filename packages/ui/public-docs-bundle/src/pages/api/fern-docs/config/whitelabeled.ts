import { get } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<boolean>> {
    const domain = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host") ?? req.nextUrl.host;

    const customers = await get("whitelabeled");
    if (!Array.isArray(customers)) {
        return NextResponse.json(false);
    }

    return NextResponse.json(customers.some((customer) => domain.toLowerCase().includes(customer.toLowerCase())));
}
