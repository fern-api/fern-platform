import { NextRequest, NextResponse } from "next/server";

import { fetchFacetValues } from "@fern-docs/search-server/algolia";
import { algoliasearch } from "algoliasearch";

import { algoliaAppId } from "@/server/env-variables";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const filters = request.nextUrl.searchParams.getAll("filters");
  const apiKey =
    request.nextUrl.searchParams.get("x-algolia-api-key") ?? undefined;

  if (!apiKey) {
    return NextResponse.json(
      { error: "x-algolia-api-key is required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    await fetchFacetValues({
      filters,
      client: algoliasearch(algoliaAppId(), apiKey),
    })
  );
}
