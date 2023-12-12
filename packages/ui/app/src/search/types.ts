import { DocsV1Read } from "@fern-api/fdr-sdk";
import type { Hit as AlgoliaHit } from "instantsearch.js";

export type SearchRecord = AlgoliaHit<DocsV1Read.AlgoliaRecord & Record<string, unknown>>;
export type EndpointSearchRecordV2 = AlgoliaHit<DocsV1Read.AlgoliaEndpointRecordV2 & Record<string, unknown>>;
export type PageSearchRecordV2 = AlgoliaHit<DocsV1Read.AlgoliaPageRecordV2 & Record<string, unknown>>;
