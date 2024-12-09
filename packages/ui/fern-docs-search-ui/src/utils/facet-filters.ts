import { FacetFilters } from "algoliasearch/lite";
import { FacetFilter } from "../types";

export function toAlgoliaFacetFilters(filters: readonly FacetFilter[]): string[] {
    return filters.map((filter) => `${filter.facet}:${filter.value}`) satisfies FacetFilters;
}
