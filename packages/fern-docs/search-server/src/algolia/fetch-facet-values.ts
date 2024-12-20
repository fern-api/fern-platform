import { Algoliasearch } from "algoliasearch";
import { zip } from "es-toolkit/array";
import { SEARCH_INDEX } from "./constants";
import { FacetName, SEARCHABLE_FACET_ATTRIBUTES } from "./types";

export type FacetsResponse = Partial<
  Record<FacetName, { value: string; count: number }[]>
>;

async function fetchFacetValues(opts: {
  client: Algoliasearch;
  filters: string[];
}): Promise<Partial<Record<FacetName, { value: string; count: number }[]>>> {
  const { client, filters } = opts;
  const response: FacetsResponse = {
    type: [],
    api_type: [],
    method: [],
    status_code: [],
    "product.title": [],
    "version.title": [],
    availability: [],
  };

  const { results } = await client
    .searchForFacets({
      requests: SEARCHABLE_FACET_ATTRIBUTES.map((facet) => ({
        indexName: SEARCH_INDEX,
        facet,
        facetFilters: filters,
        type: "facet",
        distinct: true,
      })),
    })
    .catch((err: unknown) => {
      console.error(err);
      return { results: [] };
    });

  if (results.length === 0) {
    return response;
  }

  zip(results, SEARCHABLE_FACET_ATTRIBUTES).forEach(
    ([{ facetHits }, attribute]) => {
      const filteredFacets = facetHits.filter((hit) => hit.count > 0);

      if (filteredFacets.length < 2) {
        return;
      }

      filteredFacets.forEach((hit) => {
        (response[attribute] ??= []).push({
          value: hit.value,
          count: hit.count,
        });
      });
    }
  );

  return response;
}

export { fetchFacetValues };
