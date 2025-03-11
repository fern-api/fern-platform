import { NextRequest } from "next/server";

import z from "zod";

import { getFernToken } from "@/app/fern-token";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

const bodySchema = z.object({
  content: z.string(),
  scope: z.record(z.string(), z.unknown()).optional(),
  filename: z.string().optional(),
  toc: z.boolean().optional(),
  url: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ host: string; domain: string }> }
) {
  const { content, scope, filename, toc, url } = bodySchema.parse(
    await request.json()
  );

  const { host, domain } = await params;
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );

  const serializer = createCachedMdxSerializer(loader, { scope });
  const result = await serializer(content, { filename, toc, url });
  return Response.json(result);
}
