import { Cohere, CohereClient } from "cohere-ai";

export const runtime = "edge";

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== "POST") {
        return new Response(null, { status: 405 });
    }

    const response = await cohere.generateStream({
        prompt: "Can you generate me a paragraph of 50 words?",
    });

    const stream = convertAsyncIterableToStream(response).pipeThrough(getCohereStreamTransformer());

    return new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}

function convertAsyncIterableToStream<T>(iterable: AsyncIterable<T>): ReadableStream<T> {
    return new ReadableStream({
        async start(controller) {
            for await (const chunk of iterable) {
                controller.enqueue(chunk);
            }
            controller.close();
        },
    });
}

function getCohereStreamTransformer() {
    const encoder = new TextEncoder();
    return new TransformStream<Cohere.GenerateStreamedResponse, Uint8Array>({
        async transform(chunk, controller) {
            if (chunk.eventType === "text-generation") {
                controller.enqueue(encoder.encode(chunk.text));
            }
        },
    });
}
