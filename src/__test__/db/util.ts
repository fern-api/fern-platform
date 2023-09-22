import type { DocsV2, IndexSegment } from "@prisma/client";

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
        apiName: "",
        docsDefinition: Buffer.from("nil"),
        orgID: "",
        updatedTime: new Date(),
        docsConfigInstanceId: "123",
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
