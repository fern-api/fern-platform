import type {
    AlgoliaRecord,
    ApiReferenceRecord,
    ChangelogRecord,
    MarkdownRecord,
} from "@fern-ui/fern-docs-search-server/types";
import type { BaseHit, Hit } from "instantsearch.js";
import { MarkRequired } from "ts-essentials";

export type AlgoliaRecordHit = Hit<AlgoliaRecord & BaseHit>;
export type MarkdownRecordHit = MarkRequired<Hit<MarkdownRecord>, "type">;
export type ChangelogRecordHit = MarkRequired<Hit<ChangelogRecord>, "type">;
export type ApiReferenceRecordHit = MarkRequired<Hit<ApiReferenceRecord>, "type">;

export interface FacetFilter {
    facet: FacetName;
    value: string;
}

export interface FacetOpts {
    filters: readonly FacetFilter[];
}

export const FACET_NAMES = [
    "product.title",
    "version.title",
    "type",
    "api_type",
    "method",
    "status_code",
    "availability",
] as const;
export type FacetName = (typeof FACET_NAMES)[number];
export type FacetsResponse = Record<FacetName, { value: string; count: number }[]>;
export const EMPTY_FACETS_RESPONSE: FacetsResponse = {
    "product.title": [],
    "version.title": [],
    type: [],
    api_type: [],
    method: [],
    status_code: [],
    availability: [],
} as const;

export function isFacetName(facet: string): facet is FacetName {
    return FACET_NAMES.includes(facet as FacetName);
}

export interface FilterOption {
    facet: FacetName;
    value: string;
    count: number;
}
