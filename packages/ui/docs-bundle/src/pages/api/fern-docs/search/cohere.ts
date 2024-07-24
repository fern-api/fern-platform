import { CohereClient } from "cohere-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

export default async function POST(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "POST") {
        return new NextResponse(null, { status: 405 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start: async (controller) => {
            const response = await cohere.generateStream({
                prompt: "Can you generate me a paragraph of 50 words?",
            });
            for await (const chunk of response) {
                if (chunk.eventType === "text-generation") {
                    controller.enqueue(encoder.encode(chunk.text + "\n"));
                }
            }
            controller.close();
        },
    });

    return new NextResponse(stream, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}

export function toReadableStream<T>(iterable: AsyncIterable<T>): ReadableStream<T> {
    return new ReadableStream({
        async start(controller) {
            for await (const chunk of iterable) {
                controller.enqueue(chunk);
            }
            controller.close();
        },
    });
}
