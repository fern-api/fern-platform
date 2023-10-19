import * as FernRegistryApiRead from "../../../../generated/api/resources/api/resources/v1/resources/read";
import { DocsDefinitionSummary } from "../../../types";

const API_DEF_1: FernRegistryApiRead.ApiDefinition = {
    id: "api-1" as FernRegistryApiRead.ApiDefinition["id"],
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
                },
            ],
        },
    },
    types: {},
};

export const DEFINITION_UNVERSIONED_WITH_SKIPPED_SLUGS: DocsDefinitionSummary = {
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
                    title: "Help Center",
                    icon: "",
                    urlSlug: "help-center",
                    items: [
                        {
                            type: "section",
                            title: "Documents",
                            urlSlug: "documents",
                            skipUrlSlug: true,
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
                    items: [
                        {
                            type: "api",
                            api: API_DEF_1.id,
                            title: "API Reference",
                            showErrors: true,
                            skipUrlSlug: true,
                            urlSlug: "api-reference",
                        },
                    ],
                    urlSlug: "api-reference",
                },
            ],
        },
    },
};
