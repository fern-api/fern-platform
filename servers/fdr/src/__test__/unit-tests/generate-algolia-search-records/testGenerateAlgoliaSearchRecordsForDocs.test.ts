import {
    APIV1Write,
    DocsV1Write,
    FdrAPI,
    SDKSnippetHolder,
    convertAPIDefinitionToDb,
    convertDocsDefinitionToDb,
    visitDbNavigationConfig,
} from "@fern-api/fdr-sdk";
import { resolve } from "path";
import type { AlgoliaSearchRecord } from "../../../services/algolia";
import { AlgoliaIndexSegmentManagerServiceImpl } from "../../../services/algolia-index-segment-manager";
import { AlgoliaSearchRecordGeneratorV2 } from "../../../services/algolia/AlgoliaSearchRecordGeneratorV2";
import { createMockFdrApplication } from "../../mock";

const FIXTURES_DIR = resolve(__dirname, "fixtures");
const FIXTURES: Fixture[] = [
    {
        name: "primer",
    },
    {
        name: "vellum",
    },
    {
        name: "candid",
    },
    {
        name: "humanloop",
    },
];

function loadDocsDefinition(fixture: Fixture) {
    const filePath = resolve(FIXTURES_DIR, fixture.name, "docs.json");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath) as DocsV1Write.DocsDefinition;
}

function loadApiDefinition(fixture: Fixture, id: string) {
    const filePath = resolve(FIXTURES_DIR, fixture.name, "apis", `${id}.json`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath) as APIV1Write.ApiDefinition;
}

type FilteredSearchRecord = Omit<AlgoliaSearchRecord, "objectID">;

function filterSearchRecord(record: AlgoliaSearchRecord): FilteredSearchRecord {
    const { objectID: _, ...rest } = record;
    return rest;
}

interface Fixture {
    name: string;
    only?: boolean;
}

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    snippetsConfigWithSdkId: {},
    snippetTemplatesByEndpoint: {},
    snippetsBySdkIdAndEndpointId: {},
    snippetTemplatesByEndpointId: {},
});

describe("generateAlgoliaSearchRecordsForDocs", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const docsDefinition = convertDocsDefinitionToDb({
                    writeShape: loadDocsDefinition(fixture),
                    files: {},
                });

                const preloadApiDefinitions = () => {
                    const apiIdDefinitionTuples = docsDefinition.referencedApis.map((id) => {
                        const apiDef = loadApiDefinition(fixture, id);
                        return [id, convertAPIDefinitionToDb(apiDef, id, EMPTY_SNIPPET_HOLDER)] as const;
                    });

                    return Object.fromEntries(apiIdDefinitionTuples);
                };

                const apiDefinitionsById = preloadApiDefinitions();
                const recordsWithoutIds: Omit<AlgoliaSearchRecord, "objectID">[] = [];
                const navigationConfig = docsDefinition.config.navigation;
                const generator = new AlgoliaSearchRecordGeneratorV2({ docsDefinition, apiDefinitionsById });

                if (navigationConfig == null) {
                    throw new Error("Navigation config is required for this test");
                }

                visitDbNavigationConfig(navigationConfig, {
                    versioned: (config) => {
                        config.versions.forEach((v) => {
                            const indexSegmentRecords = generator.generateAlgoliaSearchRecordsForSpecificDocsVersion(
                                v.config,
                                {
                                    type: "versioned",
                                    id: FdrAPI.IndexSegmentId(`${v.version}-constant`),
                                    searchApiKey: "api_key",
                                    version: { id: v.version, urlSlug: v.urlSlug },
                                },
                            );
                            recordsWithoutIds.push(...indexSegmentRecords.map(filterSearchRecord));
                        });
                    },
                    unversioned: (config) => {
                        const records = generator.generateAlgoliaSearchRecordsForSpecificDocsVersion(config, {
                            type: "unversioned",
                            id: FdrAPI.IndexSegmentId("constant"),
                            searchApiKey: "api_key",
                        });
                        recordsWithoutIds.push(...records.map(filterSearchRecord));
                    },
                });

                expect(recordsWithoutIds).toMatchSnapshot();
            },
            90_000,
        );
    }
});

describe("generateIndexSegmentsForDefinition", () => {
    const indexSegmentManager = new AlgoliaIndexSegmentManagerServiceImpl(createMockFdrApplication({}));
    it("should strip spaces from the version ID", () => {
        const segments = indexSegmentManager.generateIndexSegmentsForDefinition({
            dbDocsDefinition: {
                type: "v3",
                pages: {},
                referencedApis: [],
                files: {},
                config: {
                    navigation: {
                        versions: [
                            {
                                version: FdrAPI.VersionId("version with spaces"),
                                config: {
                                    items: [],
                                    landingPage: undefined,
                                },
                                urlSlug: undefined,
                                availability: undefined,
                            },
                            {
                                version: FdrAPI.VersionId("version with (special) chars"),
                                config: {
                                    items: [],
                                    landingPage: undefined,
                                },
                                urlSlug: undefined,
                                availability: undefined,
                            },
                        ],
                    },
                    root: undefined,
                    title: undefined,
                    defaultLanguage: undefined,
                    announcement: undefined,
                    navbarLinks: undefined,
                    footerLinks: undefined,
                    logoHeight: undefined,
                    logoHref: undefined,
                    favicon: undefined,
                    metadata: undefined,
                    redirects: undefined,
                    backgroundImage: undefined,
                    colorsV3: undefined,
                    layout: undefined,
                    typographyV2: undefined,
                    analyticsConfig: undefined,
                    integrations: undefined,
                    css: undefined,
                    js: undefined,
                    logo: undefined,
                    logoV2: undefined,
                    colors: undefined,
                    colorsV2: undefined,
                    typography: undefined,
                },
                jsFiles: undefined,
            },
            url: "https://example.com",
        });

        expect(segments.type).toBe("versioned");
        if (segments.type === "versioned") {
            expect(segments.configSegmentTuples[0]?.[1].id).toContain("version-with-spaces");
            expect(segments.configSegmentTuples[1]?.[1].id).toContain("version-with-special-chars");
        }
    });
});
