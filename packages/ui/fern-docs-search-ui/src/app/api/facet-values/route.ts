import { algoliaAppId } from "@/server/env-variables";
import { FACET_NAMES, FacetsResponse } from "@/utils/facet-display";
import { algoliasearch } from "algoliasearch";
import { zip } from "es-toolkit/array";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get("domain");
    const filters = request.nextUrl.searchParams.get("filters") ?? undefined;
    const apiKey = request.nextUrl.searchParams.get("x-algolia-api-key") ?? undefined;
    if (!domain) {
        return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    if (!apiKey) {
        return NextResponse.json({ error: "x-algolia-api-key is required" }, { status: 400 });
    }

    const { results } = await algoliasearch(algoliaAppId(), apiKey).searchForFacets({
        requests: FACET_NAMES.map((facet) => ({
            indexName: "fern-docs-search",
            facet,
            filters,
            type: "facet",
            distinct: true,
        })),
    });

    const response: FacetsResponse = {
        type: [],
        api_type: [],
        method: [],
        status_code: [],
        "product.title": [],
        "version.title": [],
    };

    zip(results, FACET_NAMES).forEach(([{ facetHits }, attribute]) => {
        const filteredFacets = facetHits.filter((hit) => hit.count > 0);

        if (filteredFacets.length < 2) {
            return;
        }

        filteredFacets.forEach((hit) => {
            response[attribute].push({ value: hit.value, count: hit.count });
        });
    });

    return NextResponse.json(response);
}
