import * as FernRegistryDocsRead from "../../../../generated/api/resources/docs/resources/v1/resources/read";
import { DocsDefinitionSummary } from "../../../types";

export const DEFINITION_UNVERSIONED_UNTABBED: DocsDefinitionSummary = {
    apis: {},
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
};
