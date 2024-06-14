import { Algolia, DocsV1Db } from "../../api";
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
