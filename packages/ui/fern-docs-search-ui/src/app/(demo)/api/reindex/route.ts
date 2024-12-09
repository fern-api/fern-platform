import { runReindex } from "@/server/run-reindex";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
    domain: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { domain } = BodySchema.parse(await request.json());

    return NextResponse.json(await runReindex(domain));
}
