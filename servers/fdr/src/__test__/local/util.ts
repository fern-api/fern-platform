import { APIV1Write, FdrClient } from "@fern-api/fdr-sdk";
import { APIResponse } from "@fern-api/fdr-sdk/dist/client/generated/core";
import type { DocsV2, IndexSegment } from "@prisma/client";

export function getUniqueDocsForUrl(prefix: string): string {
    return `${prefix}_${Math.random()}.fern.com`;
}

export function createApiDefinition({
    endpointId,
    endpointPath,
    endpointMethod,
    snippetsConfig,
}: {
    endpointId: APIV1Write.EndpointId;
    endpointPath: APIV1Write.EndpointPath;
    endpointMethod: APIV1Write.HttpMethod;
    snippetsConfig?: APIV1Write.SnippetsConfig;
}): APIV1Write.ApiDefinition {
    return {
        rootPackage: {
            endpoints: [
                {
                    id: endpointId,
                    method: endpointMethod,
                    path: endpointPath,
                    headers: [],
                    queryParameters: [],
                    examples: [],
                },
            ],
            types: [],
            subpackages: [],
            websockets: [],
        },
        subpackages: {},
        types: {},
        snippetsConfiguration: snippetsConfig,
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

export function getAPIResponse<Success, Failure>(response: APIResponse<Success, Failure>): Success {
    if (response.ok) {
        return response.body;
    }
    throw new Error(`Received error from response: ${JSON.stringify(response.error)}`);
}

export function getClient({ authed, url }: { url: string; authed: boolean }): FdrClient {
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
