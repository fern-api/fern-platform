import { Algolia } from "@fern-api/fdr-sdk/client/types";
import type { Hit as AlgoliaHit } from "instantsearch.js";

export type SearchRecord = AlgoliaHit<Algolia.AlgoliaRecord & Record<string, unknown>>;
export type EndpointSearchRecordV2 = AlgoliaHit<Algolia.AlgoliaEndpointRecordV2 & Record<string, unknown>>;
export type PageSearchRecordV2 = AlgoliaHit<Algolia.AlgoliaPageRecordV2 & Record<string, unknown>>;
