import { APIV1Read, Algolia, DocsV1Db } from "../../api";
import { AlgoliaRecordVersionV3, BreadcrumbsInfo } from "../../api/generated/api";
import { EndpointPathPart, HttpMethod } from "../../api/generated/api/resources/api/resources/v1/resources/read";
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
    breadcrumbs: BreadcrumbsInfo[];
    slugPrefix: string;
    version: AlgoliaRecordVersionV3 | undefined;
    indexSegmentId: string;
    method?: HttpMethod;
    endpointPath: EndpointPathPart[];
    isResponseStream?: boolean;
};

export type MarkdownNode = {
    level: number;
    heading: string;
    content: string;
    children: MarkdownNode[];
};
