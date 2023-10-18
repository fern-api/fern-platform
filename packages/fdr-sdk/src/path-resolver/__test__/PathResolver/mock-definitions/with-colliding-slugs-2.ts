import * as FernRegistryDocsRead from "../../../../generated/api/resources/docs/resources/v1/resources/read";
import { DocsDefinitionSummary } from "../../../types";

export const DEFINITION_WITH_COLLIDING_SLUGS_2: DocsDefinitionSummary = {
    apis: {},
    docsConfig: {
        colorsV3: {
            type: "dark",
            accentPrimary: { r: 0, g: 0, b: 0 },
            background: { type: "solid", r: 0, g: 0, b: 0 },
        },
        navbarLinks: [],
        navigation: {
            versions: [
                {
                    version: FernRegistryDocsRead.VersionId("v2"),
                    urlSlug: "v2",
                    config: {
                        tabs: [
                            {
                                title: "V1",
                                icon: "",
                                urlSlug: "v1",
                                items: [
                                    {
                                        type: "section",
                                        title: "Welcome",
                                        urlSlug: "welcome",
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
                        ],
                    },
                },
                {
                    version: FernRegistryDocsRead.VersionId("v1"),
                    urlSlug: "v1",
                    config: {
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
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    },
};
