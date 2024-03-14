import { APIV1Write } from "@fern-api/fdr-sdk";
import type { DocsV2, IndexSegment } from "@prisma/client";

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
