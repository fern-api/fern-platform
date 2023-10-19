import * as FernRegistryApiRead from "../../../../generated/api/resources/api/resources/v1/resources/read";
import { DocsDefinitionSummary } from "../../../types";

const API_DEF_1: FernRegistryApiRead.ApiDefinition = {
    id: "api-1" as FernRegistryApiRead.ApiDefinition["id"],
    rootPackage: {
        endpoints: [],
        subpackages: ["new-sub"],
        types: [],
        webhooks: [],
    },
    subpackages: {
        ["new-sub"]: {
            name: "",
            subpackageId: "new-sub",
            subpackages: ["old-sub"],
            types: [],
            urlSlug: "new-sub",
            webhooks: [],
            endpoints: [],
            pointsTo: "old-sub",
        },
        ["old-sub"]: {
            name: "",
            subpackageId: "old-sub",
            subpackages: [],
            types: [],
            urlSlug: "old-sub",
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

export const DEFINITION_WITH_POINTS_TO: DocsDefinitionSummary = {
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
};
