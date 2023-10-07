import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export const DEFINITION_UNVERSIONED_UNTABBED: FernRegistryDocsRead.DocsDefinition = {
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
