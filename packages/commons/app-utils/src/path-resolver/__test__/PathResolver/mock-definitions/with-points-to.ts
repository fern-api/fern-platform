import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

const API_DEF_1: FernRegistryApiRead.ApiDefinition = {
    id: "api-1" as FernRegistryApiRead.ApiDefinition["id"],
    rootPackage: {
        endpoints: [],
        subpackages: [FernRegistryApiRead.SubpackageId("new-sub")],
        types: [],
        webhooks: [],
    },
    subpackages: {
        [FernRegistryApiRead.SubpackageId("new-sub")]: {
            name: "",
            subpackageId: FernRegistryApiRead.SubpackageId("new-sub"),
            subpackages: [FernRegistryApiRead.SubpackageId("old-sub")],
            types: [],
            urlSlug: "new-sub",
            webhooks: [],
            endpoints: [],
            pointsTo: FernRegistryApiRead.SubpackageId("old-sub"),
        },
        [FernRegistryApiRead.SubpackageId("old-sub")]: {
            name: "",
            subpackageId: FernRegistryApiRead.SubpackageId("old-sub"),
            subpackages: [],
            types: [],
            urlSlug: "old-sub",
            webhooks: [],
            endpoints: [
                {
                    id: FernRegistryApiRead.EndpointId("ep_1"),
                    method: "POST",
                    authed: false,
                    environments: [],
                    errors: [],
                    examples: [],
                    headers: [],
                    path: { parts: [], pathParameters: [] },
                    queryParameters: [],
                    urlSlug: "create-agent",
                },
                {
                    id: FernRegistryApiRead.EndpointId("ep_2"),
                    method: "POST",
                    authed: false,
                    environments: [],
                    errors: [],
                    examples: [],
                    headers: [],
                    path: { parts: [], pathParameters: [] },
                    queryParameters: [],
                    urlSlug: "update-agent",
                },
            ],
        },
    },
    types: {},
};

export const DEFINITION_WITH_POINTS_TO: FernRegistryDocsRead.DocsDefinition = {
    pages: {},
    apis: {
        [API_DEF_1.id]: API_DEF_1,
    },
    files: {},
    config: {
        colorsV3: {
            type: "dark",
            accentPrimary: { r: 0, g: 0, b: 0 },
            background: { type: "solid", r: 0, g: 0, b: 0 },
        },
        navbarLinks: [],
        navigation: {
            items: [
                {
                    type: "section",
                    title: "Introduction",
                    urlSlug: "introduction",
                    skipUrlSlug: false,
                    collapsed: false,
                    items: [
                        {
                            type: "page",
                            id: FernRegistryDocsRead.PageId("introduction/getting-started.mdx"),
                            title: "Getting Started",
                            urlSlug: "getting-started",
                        },
                        {
                            type: "page",
                            id: FernRegistryDocsRead.PageId("introduction/authentication.mdx"),
                            title: "Authentication",
                            urlSlug: "authentication",
                        },
                    ],
                },
                {
                    type: "api",
                    api: API_DEF_1.id,
                    showErrors: true,
                    skipUrlSlug: false,
                    title: "",
                    urlSlug: "api-reference",
                },
            ],
        },
    },
    search: {
        type: "singleAlgoliaIndex",
        value: {
            type: "unversioned",
            indexSegment: {
                id: FernRegistryDocsRead.IndexSegmentId("seg_1"),
                searchApiKey: "",
            },
        },
    },
};
