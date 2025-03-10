import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { kv } from "@vercel/kv";
import { escapeRegExp } from "es-toolkit/string";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ host: string; domain: string }> }
): Promise<NextResponse> {
  const start = performance.now();

  const { domain } = await props.params;
  revalidateTag(domain);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(`invalidating:${domain}\n`);

        try {
          await kv.del(domain);
        } catch (e) {
          console.error(e);
          controller.enqueue(
            `invalidate-kv-keys-set-failed:error=${escapeRegExp(String(e))}\n`
          );
        }

        const end = performance.now();
        console.log(`Reindex took ${end - start}ms`);
        controller.enqueue(`invalidate-finished:${end - start}ms\n`);
      } catch (e) {
        console.error(e);
        controller.enqueue(
          `invalidate-failed:error=${escapeRegExp(String(e))}\n`
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
