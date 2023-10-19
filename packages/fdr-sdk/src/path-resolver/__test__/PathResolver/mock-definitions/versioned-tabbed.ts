import { DocsDefinitionSummary } from "../../../types";

export const DEFINITION_VERSIONED_TABBED: DocsDefinitionSummary = {
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
                                    {
                                        type: "section",
                                        title: "Advanced Concepts",
                                        urlSlug: "advanced-concepts",
                                        skipUrlSlug: false,
                                        collapsed: false,
                                        items: [
                                            {
                                                type: "page",
                                                id: "advanced-concepts/streaming.mdx",
                                                title: "Streaming",
                                                urlSlug: "streaming",
                                            },
                                            {
                                                type: "page",
                                                id: "advanced-concepts/sharding.mdx",
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
                                                id: "documents/uploading-documents.mdx",
                                                title: "Uploading Documents",
                                                urlSlug: "uploading-documents",
                                            },
                                            {
                                                type: "page",
                                                id: "documents/deleting-documents.mdx",
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
                {
                    version: "v1.2",
                    urlSlug: "v1-2",
                    config: {
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
                                                id: "introduction/getting-started.mdx",
                                                title: "Getting Started",
                                                urlSlug: "getting-started",
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
                                                id: "advanced-concepts/streaming.mdx",
                                                title: "Streaming",
                                                urlSlug: "streaming",
                                            },
                                            {
                                                type: "page",
                                                id: "advanced-concepts/sharding.mdx",
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
                                                id: "documents/uploading-documents.mdx",
                                                title: "Uploading Documents",
                                                urlSlug: "uploading-documents",
                                            },
                                            {
                                                type: "page",
                                                id: "documents/deleting-documents.mdx",
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
            ],
        },
    },
};
