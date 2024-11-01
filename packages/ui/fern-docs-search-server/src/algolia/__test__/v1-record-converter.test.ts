import { ApiDefinition } from "@fern-api/fdr-sdk";
import { FernRegistry } from "../../../../../fdr-sdk/src/client/generated/index.js";
import { generateEndpointRecord } from "../records/generateEndpointRecords.js";
import { convertEndpointV4ToV3, convertPageV4ToV3 } from "../v1-record-converter/convertRecords.js";

describe("v1 record converter", () => {
    it("should convert endpoint v4 to v3", () => {
        const endpoint: ApiDefinition.EndpointDefinition = {
            id: FernRegistry.EndpointId("endpoint-id"),
            method: "GET",
            path: [
                {
                    type: "literal",
                    value: "path",
                },
            ],
            auth: [ApiDefinition.AuthSchemeId("bearer")],
            defaultEnvironment: FernRegistry.EnvironmentId("default"),
            environments: [
                {
                    id: FernRegistry.EnvironmentId("default"),
                    baseUrl: "https://example.com",
                },
            ],
            pathParameters: undefined,
            queryParameters: undefined,
            requestHeaders: undefined,
            responseHeaders: undefined,
            request: {
                contentType: undefined,
                body: {
                    type: "object",
                    properties: [
                        {
                            key: FernRegistry.PropertyKey("propertyKey"),
                            valueShape: {
                                type: "alias",
                                value: {
                                    type: "primitive",
                                    value: {
                                        type: "string",
                                        regex: undefined,
                                        minLength: undefined,
                                        maxLength: undefined,
                                        default: undefined,
                                    },
                                },
                            },
                            description: undefined,
                            availability: undefined,
                        },
                    ],
                    extraProperties: undefined,
                    extends: [],
                },
                description: undefined,
            },
            response: undefined,
            errors: undefined,
            examples: undefined,
            snippetTemplates: undefined,
            description: undefined,
            availability: undefined,
            namespace: undefined,
        };

        expect(
            convertEndpointV4ToV3(
                generateEndpointRecord({
                    indexSegmentId: FernRegistry.IndexSegmentId("index-segment-id"),
                    node: {
                        type: "endpoint",
                        method: "GET",
                        endpointId: FernRegistry.EndpointId("endpoint-id"),
                        isResponseStream: false,
                        playground: undefined,
                        availability: undefined,
                        title: "title",
                        slug: FernRegistry.navigation.latest.Slug("slug"),
                        canonicalSlug: undefined,
                        icon: undefined,
                        hidden: undefined,
                        authed: undefined,
                        id: FernRegistry.navigation.latest.NodeId("node-id"),
                        viewers: [],
                        orphaned: false,
                        apiDefinitionId: FernRegistry.ApiDefinitionId("api-definition-id"),
                    },
                    breadcrumb: [
                        {
                            title: "breadcrumb",
                            pointsTo: FernRegistry.navigation.latest.Slug("https://example.com"),
                        },
                    ],
                    endpoint,
                    version: {
                        id: FernRegistry.VersionId("version-id"),
                        slug: FernRegistry.navigation.v1.Slug("slug"),
                    },
                }),
                endpoint,
                {},
            ),
        ).toEqual({
            breadcrumbs: ["breadcrumb"],
            content: `
## Path Parameters

- path
## Request

### Body

- propertyKey=string `,
            endpointPath: [
                {
                    type: "literal",
                    value: "path",
                },
            ],
            indexSegmentId: "index-segment-id",
            isResponseStream: false,
            method: "GET",
            slug: "slug",
            title: "title",
            type: "endpoint-v3",
            version: {
                id: "version-id",
                slug: "slug",
            },
        });
    });

    it("should convert page record v4 to v3", () => {
        expect(
            convertPageV4ToV3(
                {
                    type: "page-v4",
                    title: "title",
                    slug: FernRegistry.navigation.v1.Slug("slug"),
                    description: "description",
                    breadcrumbs: [
                        {
                            title: "breadcrumb",
                            slug: FernRegistry.navigation.latest.Slug("https://example.com"),
                        },
                    ],
                    version: {
                        id: FernRegistry.VersionId("version-id"),
                        slug: FernRegistry.navigation.v1.Slug("slug"),
                    },
                    indexSegmentId: FernRegistry.IndexSegmentId("index-segment-id"),
                },
                "some markdown content",
            ),
        ).toEqual({
            breadcrumbs: ["breadcrumb"],
            content: "some markdown content",
            indexSegmentId: "index-segment-id",
            slug: "slug",
            title: "title",
            type: "page-v3",
            version: {
                id: "version-id",
                slug: "slug",
            },
        });
    });
});
