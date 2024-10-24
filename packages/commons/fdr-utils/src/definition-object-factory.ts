import { FdrAPI } from "@fern-api/fdr-sdk/client/types";

export class DefinitionObjectFactory {
    public static createDocsDefinition(): FdrAPI.docs.v1.read.DocsDefinition {
        return {
            pages: {},
            apis: {},
            files: {},
            filesV2: {},
            config: {
                colorsV3: {
                    type: "dark",
                    accentPrimary: { r: 0, g: 0, b: 0, a: 1 },
                    background: { type: "solid", r: 0, g: 0, b: 0, a: 1 },
                    logo: undefined,
                    backgroundImage: undefined,
                    border: undefined,
                    sidebarBackground: undefined,
                    headerBackground: undefined,
                    cardBackground: undefined,
                },
                navbarLinks: [],
                navigation: { items: [], landingPage: undefined },
                root: undefined,
                title: undefined,
                defaultLanguage: undefined,
                announcement: undefined,
                footerLinks: undefined,
                logoHeight: undefined,
                logoHref: undefined,
                favicon: undefined,
                metadata: undefined,
                redirects: undefined,
                layout: undefined,
                typographyV2: undefined,
                analyticsConfig: undefined,
                integrations: undefined,
                css: undefined,
                js: undefined,
            },
            search: {
                type: "singleAlgoliaIndex",
                value: {
                    type: "unversioned",
                    indexSegment: {
                        id: FdrAPI.IndexSegmentId(""),
                        searchApiKey: "",
                    },
                },
            },
            algoliaSearchIndex: undefined,
            jsFiles: undefined,
            id: undefined,
        };
    }
}
