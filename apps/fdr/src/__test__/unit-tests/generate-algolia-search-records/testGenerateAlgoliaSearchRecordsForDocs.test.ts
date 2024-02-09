import { resolve } from "path";

import {
    SDKSnippetHolder,
    convertAPIDefinitionToDb,
    convertDocsDefinitionToDb,
    visitDbNavigationConfig,
} from "@fern-api/fdr-sdk";
import type { APIV1Write, DocsV1Write } from "../../../api";
import type { AlgoliaSearchRecord } from "../../../services/algolia";
import { AlgoliaSearchRecordGenerator } from "../../../services/algolia/AlgoliaSearchRecordGenerator";

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
