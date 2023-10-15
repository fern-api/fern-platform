import type { DocsV2, IndexSegment } from "@prisma/client";
import { FernRegistry } from "../generated";

export function createApiDefinition({
    endpointId,
    endpointPath,
    endpointMethod,
    snippetsConfig,
}: {
    endpointId: FernRegistry.api.v1.register.EndpointId;
    endpointPath: FernRegistry.api.v1.register.EndpointPath;
    endpointMethod: FernRegistry.api.v1.register.HttpMethod;
    snippetsConfig?: FernRegistry.api.v1.register.SnippetsConfig;
}): FernRegistry.api.v1.register.ApiDefinition {
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
