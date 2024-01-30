import { APIV1Read } from "../../../../client";
import { DocsDefinitionSummary } from "../../../types";

const API_DEF_1: APIV1Read.ApiDefinition = {
    id: "api-1" as APIV1Read.ApiDefinition["id"],
    rootPackage: {
        endpoints: [
            {
                id: "ep_1",
                method: "POST",
                authed: false,
                environments: [],
                errors: [],
                examples: [],
                headers: [],
                path: { parts: [], pathParameters: [] },
                queryParameters: [],
                urlSlug: "generate-completion",
                customCodeSamples: [],
            },
            {
                id: "ep_2",
                method: "DELETE",
                authed: false,
                environments: [],
                errors: [],
                examples: [],
                headers: [],
                path: { parts: [], pathParameters: [] },
                queryParameters: [],
                urlSlug: "delete-completion",
                customCodeSamples: [],
            },
        ],
        subpackages: ["sub-1"],
        types: [],
        webhooks: [],
    },
    subpackages: {
        ["sub-1"]: {
            name: "",
            subpackageId: "sub-1",
            subpackages: [],
            types: [],
            urlSlug: "agents",
            webhooks: [],
            endpoints: [
                {
                    id: "ep_1",
                    method: "POST",
                    authed: false,
                    environments: [],
                    errors: [],
                    examples: [],
                    headers: [],
                    path: { parts: [], pathParameters: [] },
                    queryParameters: [],
                    urlSlug: "create-agent",
                    customCodeSamples: [],
                },
                {
                    id: "ep_2",
                    method: "POST",
                    authed: false,
                    environments: [],
                    errors: [],
                    examples: [],
                    headers: [],
                    path: { parts: [], pathParameters: [] },
                    queryParameters: [],
                    urlSlug: "update-agent",
                    customCodeSamples: [],
                },
            ],
        },
    },
    types: {},
};

export const DEFINITION_WITH_API: DocsDefinitionSummary = {
    apis: {
        [API_DEF_1.id]: API_DEF_1,
    },
    docsConfig: {
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
};
