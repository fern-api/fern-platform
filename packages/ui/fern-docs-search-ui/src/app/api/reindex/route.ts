import { qstashCurrentSigningKey, qstashNextSigningKey } from "@/server/env-variables";
import { runReindex } from "@/server/run-reindex";
import { Receiver } from "@upstash/qstash";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
    domain: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    const c = new Receiver({
        currentSigningKey: qstashCurrentSigningKey(),
        nextSigningKey: qstashNextSigningKey(),
    });

    const body = await request.text();

    const isValid = await c.verify({
        signature: request.headers.get("x-qstash-signature") || "",
        body,
    });

    if (!isValid) {
        return new NextResponse("Invalid signature", { status: 401 });
    }

    const { domain } = BodySchema.parse(JSON.parse(body));

    return NextResponse.json(await runReindex(domain));
}
