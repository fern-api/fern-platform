import { DocsDefinitionSummary } from "../../../types";

export const DEFINITION_VERSIONED_UNTABBED: DocsDefinitionSummary = {
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
                    version: "v2",
                    urlSlug: "v2",
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
                                        id: "introduction/getting-started.mdx",
                                        title: "Getting Started",
                                        urlSlug: "getting-started",
                                    },
                                    {
                                        type: "page",
                                        id: "introduction/authentication.mdx",
                                        title: "Authentication",
                                        urlSlug: "authentication",
                                    },
                                    {
                                        type: "page",
                                        id: "introduction/changelog.mdx",
                                        title: "Changelog",
                                        urlSlug: "changelog",
                                    },
                                ],
                            },
                        ],
                    },
                },
                {
                    version: "v1.2",
                    urlSlug: "v1-2",
                    config: {
                        items: [
                            {
                                type: "section",
                                title: "Welcome",
                                urlSlug: "introduction",
                                skipUrlSlug: false,
                                collapsed: false,
                                items: [
                                    {
                                        type: "page",
                                        id: "introduction/getting-started.mdx",
                                        title: "Getting Started",
                                        urlSlug: "getting-started",
                                    },
                                    {
                                        type: "page",
                                        id: "introduction/authentication.mdx",
                                        title: "Authentication",
                                        urlSlug: "authentication",
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
