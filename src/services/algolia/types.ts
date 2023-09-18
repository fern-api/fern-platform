import type * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import type * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";
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

export type ConfigSegmentTuple = readonly [
    config: FernRegistryDocsDb.UnversionedNavigationConfig,
    segment: IndexSegment
];

type WithObjectId<T> = { objectID: string } & T;

export type AlgoliaSearchRecord = WithObjectId<FernRegistryDocsRead.AlgoliaRecord>;
