import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { runSemanticSearchTurbopuffer } from "@/server/run-reindex-turbopuffer";

const BodySchema = z.object({
  domain: z.string(),
  query: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { domain, query } = BodySchema.parse(await request.json());

  const results = await runSemanticSearchTurbopuffer(query, domain);

  return NextResponse.json({ results });
}
