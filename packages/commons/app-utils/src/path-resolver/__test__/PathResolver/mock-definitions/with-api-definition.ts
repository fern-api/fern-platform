import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

const API_DEF_1: FernRegistryApiRead.ApiDefinition = {
    id: "api-1" as FernRegistryApiRead.ApiDefinition["id"],
    rootPackage: {
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
                urlSlug: "generate-completion",
            },
            {
                id: FernRegistryApiRead.EndpointId("ep_2"),
                method: "DELETE",
                authed: false,
                environments: [],
                errors: [],
                examples: [],
                headers: [],
                path: { parts: [], pathParameters: [] },
                queryParameters: [],
                urlSlug: "delete-completion",
            },
        ],
        subpackages: [FernRegistryApiRead.SubpackageId("sub-1")],
        types: [],
        webhooks: [],
    },
    subpackages: {
        [FernRegistryApiRead.SubpackageId("sub-1")]: {
            name: "",
            subpackageId: FernRegistryApiRead.SubpackageId("sub-1"),
            subpackages: [],
            types: [],
            urlSlug: "agents",
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

export const DEFINITION_WITH_API: FernRegistryDocsRead.DocsDefinition = {
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
            tabs: [
                {
                    title: "Welcome",
                    icon: "",
                    urlSlug: "welcome",
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
                            type: "section",
                            title: "Advanced Concepts",
                            urlSlug: "advanced-concepts",
                            skipUrlSlug: false,
                            collapsed: false,
                            items: [
                                {
                                    type: "page",
                                    id: FernRegistryDocsRead.PageId("advanced-concepts/streaming.mdx"),
                                    title: "Streaming",
                                    urlSlug: "streaming",
                                },
                                {
                                    type: "page",
                                    id: FernRegistryDocsRead.PageId("advanced-concepts/sharding.mdx"),
                                    title: "Sharding",
                                    urlSlug: "sharding",
                                },
                            ],
                        },
                    ],
                },
                {
                    title: "Help Center",
                    icon: "",
                    urlSlug: "help-center",
                    items: [
                        {
                            type: "section",
                            title: "Documents",
                            urlSlug: "documents",
                            skipUrlSlug: false,
                            collapsed: false,
                            items: [
                                {
                                    type: "page",
                                    id: FernRegistryDocsRead.PageId("documents/uploading-documents.mdx"),
                                    title: "Uploading Documents",
                                    urlSlug: "uploading-documents",
                                },
                                {
                                    type: "page",
                                    id: FernRegistryDocsRead.PageId("documents/deleting-documents.mdx"),
                                    title: "Deleting Documents",
                                    urlSlug: "deleting-documents",
                                },
                            ],
                        },
                    ],
                },
                {
                    title: "API Reference",
                    icon: "",
                    urlSlug: "api-reference",
                    items: [
                        {
                            type: "api",
                            api: API_DEF_1.id,
                            showErrors: true,
                            skipUrlSlug: false,
                            title: "",
                            urlSlug: "client-api",
                        },
                    ],
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
