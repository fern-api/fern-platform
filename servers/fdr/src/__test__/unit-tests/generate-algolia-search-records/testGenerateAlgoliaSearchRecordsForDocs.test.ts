import { resolve } from "path";

import {
    SDKSnippetHolder,
    convertAPIDefinitionToDb,
    convertDocsDefinitionToDb,
    visitDbNavigationConfig,
} from "@fern-api/fdr-sdk";
import type { APIV1Write, DocsV1Write } from "../../../api";
import type { AlgoliaSearchRecord } from "../../../services/algolia";
import { AlgoliaIndexSegmentManagerServiceImpl } from "../../../services/algolia-index-segment-manager";
import { AlgoliaSearchRecordGenerator } from "../../../services/algolia/AlgoliaSearchRecordGenerator";
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

                    return new Map(apiIdDefinitionTuples);
                };

                const apiDefinitionsById = preloadApiDefinitions();
                const recordsWithoutIds: Omit<AlgoliaSearchRecord, "objectID">[] = [];
                const navigationConfig = docsDefinition.config.navigation;
                const generator = new AlgoliaSearchRecordGenerator({ docsDefinition, apiDefinitionsById });

                visitDbNavigationConfig(navigationConfig, {
                    versioned: (config) => {
                        config.versions.forEach((v) => {
                            const indexSegmentRecords = generator.generateAlgoliaSearchRecordsForSpecificDocsVersion(
                                v.config,
                                {
                                    type: "versioned",
                                    id: `${v.version}-constant`,
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
                            id: "constant",
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
                                version: "version with spaces",
                                config: {
                                    items: [],
                                },
                            },
                            {
                                version: "version with (special) chars",
                                config: {
                                    items: [],
                                },
                            },
                        ],
                    },
                },
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
