import { algoliaAppId } from "@/server/env-variables";
import { selectFirst } from "@/server/utils/selectFirst";
import { toArray } from "@/server/utils/toArray";
import { fetchFacetValues } from "@fern-docs/search-server/algolia";
import { algoliasearch } from "algoliasearch";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const filters = toArray(req.nextUrl.searchParams.getAll("filters"));
  const apiKey = selectFirst(req.nextUrl.searchParams.get("apiKey"));

  if (!apiKey) {
    return NextResponse.json("apiKey is required", { status: 400 });
  }

  const facetValues = await fetchFacetValues({
    filters,
    client: algoliasearch(algoliaAppId(), apiKey),
  });

  return NextResponse.json(facetValues);
}
