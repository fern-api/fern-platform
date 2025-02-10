import {
  type AlgoliaRecord,
  type ApiReferenceRecord,
  type ChangelogRecord,
  type FacetName,
  type MarkdownRecord,
  SEARCHABLE_FACET_ATTRIBUTES,
} from "@fern-docs/search-server/algolia/types";
import type { BaseHit, Hit } from "instantsearch.js";
import { MarkRequired } from "ts-essentials";

export type AlgoliaRecordHit = Hit<AlgoliaRecord & BaseHit>;
export type MarkdownRecordHit = MarkRequired<Hit<MarkdownRecord>, "type">;
export type ChangelogRecordHit = MarkRequired<Hit<ChangelogRecord>, "type">;
export type ApiReferenceRecordHit = MarkRequired<
  Hit<ApiReferenceRecord>,
  "type"
>;

export interface FacetFilter {
  facet: FacetName;
  value: string;
}

export function isFacetName(facet: string): facet is FacetName {
  return SEARCHABLE_FACET_ATTRIBUTES.includes(facet as FacetName);
}

export interface FilterOption {
  facet: FacetName;
  value: string;
  count: number;
}
