import { FacetFilter } from "@/hooks/use-facets";
import { FacetFilters } from "algoliasearch/lite";

export function toAlgoliaFacetFilters(filters: readonly FacetFilter[]): string[] {
    return filters.map((filter) => `${filter.facet}:${filter.value}`) satisfies FacetFilters;
}
