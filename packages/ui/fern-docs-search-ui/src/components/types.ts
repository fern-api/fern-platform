import type { MarkdownRecord, VisibleAlgoliaRecord } from "@fern-ui/fern-docs-search-server/src/algolia/types";
import type { BaseHit, Hit } from "instantsearch.js";
import { MarkRequired } from "ts-essentials";

export type AlgoliaRecordHit = Hit<VisibleAlgoliaRecord & BaseHit>;
export type MarkdownRecordHit = MarkRequired<Hit<MarkdownRecord>, "type">;
