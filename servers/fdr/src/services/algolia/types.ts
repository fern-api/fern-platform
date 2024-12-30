import { APIV1Read, Algolia, DocsV1Db, FdrAPI } from "@fern-api/fdr-sdk";
import type { DocsVersion } from "../../types";

export type IndexSegment =
    | {
          type: "versioned";
          id: FdrAPI.IndexSegmentId;
          searchApiKey: string;
          version: DocsVersion;
      }
    | {
          type: "unversioned";
          id: FdrAPI.IndexSegmentId;
          searchApiKey: string;
      };

export type ConfigSegmentTuple = readonly [
    config: DocsV1Db.UnversionedNavigationConfig | undefined,
    segment: IndexSegment,
];

type WithObjectId<T> = {
    [K: string]: unknown;
    objectID: string;
} & T;

export type AlgoliaSearchRecord = WithObjectId<Algolia.AlgoliaRecord>;

export type TypeReferenceWithMetadata = {
    reference: APIV1Read.TypeReference;
    anchorIdParts: string[];
    breadcrumbs: Algolia.BreadcrumbsInfo[];
    slugPrefix: string;
    version: Algolia.AlgoliaRecordVersionV3 | undefined;
    indexSegmentId: FdrAPI.IndexSegmentId;
    method: FdrAPI.HttpMethod; // websocket is always GET (during handshake)
    endpointPath: APIV1Read.EndpointPathPart[];
    isResponseStream?: boolean;
    propertyKey: string | undefined;
    type: "endpoint-field-v1" | "websocket-field-v1" | "webhook-field-v1";
};

export type MarkdownNode = {
    level: number;
    heading: string;
    content: string;
    children: MarkdownNode[];
};

export type AlgoliaAdditionalProperties =
    | {
          type: "endpoint-field-v1";
          method: APIV1Read.HttpMethod;
          endpointPath: APIV1Read.EndpointPathPart[];
          isResponseStream?: boolean;
      }
    | {
          type: "websocket-field-v1";
          endpointPath: APIV1Read.EndpointPathPart[];
      }
    | {
          type: "webhook-field-v1";
          method: APIV1Read.HttpMethod;
          endpointPath: APIV1Read.EndpointPathPart[];
      };
