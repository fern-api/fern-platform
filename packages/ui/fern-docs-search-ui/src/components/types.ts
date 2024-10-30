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
