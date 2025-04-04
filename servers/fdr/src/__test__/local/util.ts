import type { DocsV2, IndexSegment } from "@prisma/client";
import { v4 } from "uuid";

import { APIResponse, APIV1Write, FdrAPI, FdrClient } from "@fern-api/fdr-sdk";

export function getUniqueDocsForUrl(prefix: string): string {
  return `${prefix}_${Math.random()}.fern.com`;
}

export function createApiDefinition({
  endpointId,
  endpointPath,
  endpointMethod,
  snippetsConfig,
  originalEndpointId,
}: {
  endpointId: APIV1Write.EndpointId;
  endpointPath: APIV1Write.EndpointPath;
  endpointMethod: APIV1Write.HttpMethod;
  snippetsConfig?: APIV1Write.SnippetsConfig;
  originalEndpointId?: string;
}): APIV1Write.ApiDefinition {
  return {
    rootPackage: {
      endpoints: [
        {
          id: endpointId,
          originalEndpointId,
          method: endpointMethod,
          path: endpointPath,
          headers: [],
          queryParameters: [],
          examples: [],
          auth: undefined,
          defaultEnvironment: undefined,
          environments: undefined,
          name: undefined,
          request: undefined,
          response: undefined,
          errors: undefined,
          errorsV2: undefined,
          description: undefined,
          availability: undefined,
        },
      ],
      types: [],
      subpackages: [],
      websockets: [],
      webhooks: undefined,
      pointsTo: undefined,
    },
    subpackages: {},
    types: {},
    snippetsConfiguration: snippetsConfig,
    auth: undefined,
    globalHeaders: undefined,
    navigation: undefined,
  };
}

export function createApiDefinitionLatest({
  endpointId,
  endpointPath,
  endpointMethod,
}: {
  endpointId: FdrAPI.EndpointId;
  endpointPath: FdrAPI.api.latest.PathPart[];
  endpointMethod: FdrAPI.HttpMethod;
}): FdrAPI.api.latest.ApiDefinition {
  return {
    endpoints: {
      [FdrAPI.EndpointId(endpointId)]: {
        id: FdrAPI.EndpointId(endpointId),
        method: endpointMethod,
        path: endpointPath,
        displayName: undefined,
        operationId: undefined,
        requestHeaders: undefined,
        responseHeaders: undefined,
        queryParameters: undefined,
        pathParameters: undefined,
        snippetTemplates: undefined,
        namespace: undefined,
        examples: undefined,
        auth: undefined,
        defaultEnvironment: undefined,
        environments: undefined,
        requests: undefined,
        responses: undefined,
        errors: undefined,
        description: undefined,
        availability: undefined,
      },
    },
    types: {},
    subpackages: {},
    websockets: {},
    webhooks: {},
    id: FdrAPI.ApiDefinitionId(v4()),
    auths: {},
    globalHeaders: undefined,
  };
}

export function createMockDocs({
  domain,
  path,
  indexSegmentIds,
}: {
  domain: string;
  path: string;
  indexSegmentIds: string[];
}): DocsV2 {
  return {
    domain,
    path,
    indexSegmentIds,
    algoliaIndex: null,
    docsDefinition: Buffer.from("nil"),
    orgID: "",
    updatedTime: new Date(),
    docsConfigInstanceId: "123",
    isPreview: false,
    authType: "PUBLIC",
    hasPublicS3Assets: true,
  };
}

export function createMockIndexSegment({
  id,
  version,
  createdAt,
}: {
  id: string;
  version?: string | null;
  createdAt: Date;
}): IndexSegment {
  return {
    id,
    version: version ?? null,
    createdAt,
  };
}

export function getAPIResponse<Success, Failure>(
  response: APIResponse<Success, Failure>
): Success {
  if (response.ok) {
    return response.body;
  }
  throw new Error(
    `Received error from response: ${JSON.stringify(response.error)}`
  );
}

export function getClient({
  authed,
  url,
}: {
  url: string;
  authed: boolean;
}): FdrClient {
  if (authed) {
    return new FdrClient({
      environment: url,
      token: "dummy",
    });
  }
  return new FdrClient({
    environment: url,
  });
}
