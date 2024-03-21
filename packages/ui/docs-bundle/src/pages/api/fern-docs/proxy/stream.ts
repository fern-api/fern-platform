import { ProxyRequest } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const maxDuration = 60 * 5; // 5 minutes

export default async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        if (req.method !== "POST") {
            return new NextResponse(null, { status: 405 });
        }

        const proxyRequest = (await req.json()) as ProxyRequest;
        const startTime = Date.now();
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body != null ? JSON.stringify(proxyRequest.body.value) : undefined,
        });
        if (response.body != null) {
            // const stream = new Stream<string>({
            //     stream: response.body,
            //     parse: async (i) => JSON.stringify(i) + "\n",
            //     terminator: proxyRequest.streamTerminator ?? "\n",
            // });
            // res.writeHead(response.status, undefined, {
            //     "Content-Type": response.headers.get("Content-Type") ?? "application/json",
            //     "Transfer-Encoding": "chunked",
            // });
            // res.flushHeaders();
            // for await (const chunk of stream) {
            //     const endTime = Date.now();
            //     res.write(JSON.stringify({ data: chunk, time: endTime - startTime }) + "\n");
            // }
            // res.end();

            // TextEncoder objects turn text content
            // into streams of UTF-8 characters.
            // You'll add this encoder to your stream
            const encoder = new TextEncoder();

            // TextDecoders can decode streams of
            // encoded content. You'll use this to
            // transform the streamed content before
            // it's read by the client
            const decoder = new TextDecoder();
            // TransformStreams can transform a stream's chunks
            // before they're read in the client
            const transformStream = new TransformStream({
                transform(chunk, controller) {
                    const endTime = Date.now();
                    // Decode the content, so it can be transformed
                    const text = decoder.decode(chunk);
                    // Make the text uppercase, then encode it and
                    // add it back to the stream
                    controller.enqueue(
                        encoder.encode(JSON.stringify({ data: text, time: endTime - startTime }) + "\n"),
                    );
                },
            });

            return new NextResponse(response.body.pipeThrough(transformStream), {
                headers: {
                    "Content-Type": "application/json",
                    "Transfer-Encoding": "chunked",
                },
            });
        } else {
            return new NextResponse(null, { status: response.status, statusText: response.statusText });
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500 });
    }
}
