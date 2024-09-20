import { APIV1Read, Algolia, DocsV1Db } from "../../api";
import { AlgoliaRecordVersionV3 } from "../../api/generated/api";
import type { DocsVersion } from "../../types";

export type IndexSegment =
    | {
          type: "versioned";
          id: string;
          searchApiKey: string;
          version: DocsVersion;
      }
    | {
          type: "unversioned";
          id: string;
          searchApiKey: string;
      };

export type ConfigSegmentTuple = readonly [config: DocsV1Db.UnversionedNavigationConfig, segment: IndexSegment];

type WithObjectId<T> = {
    [K: string]: unknown;
    objectID: string;
} & T;

export type AlgoliaSearchRecord = WithObjectId<Algolia.AlgoliaRecord>;

export type TypeReferenceWithMetadata = {
    reference: APIV1Read.TypeReference;
    anchorIdParts: string[];
    breadcrumbs: string[];
    slugPrefix: string;
    version: AlgoliaRecordVersionV3 | undefined;
    indexSegmentId: string;
};
