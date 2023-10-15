import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export const DEFINITION_UNVERSIONED_TABBED: FernRegistryDocsRead.DocsDefinition = {
    pages: {},
    apis: {},
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
