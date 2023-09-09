import { resolve } from "path";
import { transformApiDefinitionForDb } from "../../../controllers/api/registerToDbConversion/transformApiDefinitionToDb";
import { transformWriteDocsDefinitionToDb } from "../../../controllers/docs/transformDocsDefinitionToDb";
import type { FernRegistry } from "../../../generated";
import { AlgoliaSearchRecordGenerator } from "../../../services/algolia/AlgoliaSearchRecordGenerator";
import type * as FernRegistryApiWrite from "../../generated/api/resources/api/resources/v1/resources/register";

const FIXTURES_DIR = resolve(__dirname, "fixtures");
const FIXTURES: Fixture[] = [
    {
        name: "primer",
    },
];

function loadDocsDefinition(fixture: Fixture) {
    const filePath = resolve(FIXTURES_DIR, fixture.name, "docs.json");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath) as FernRegistry.docs.v1.write.DocsDefinition;
}

function loadApiDefinition(fixture: Fixture, id: string) {
    const filePath = resolve(FIXTURES_DIR, fixture.name, "apis", `${id}.json`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath) as FernRegistryApiWrite.ApiDefinition;
}

interface Fixture {
    name: string;
    only?: boolean;
}

describe("generateAlgoliaSearchRecordsForDocs", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const docsDefinition = loadDocsDefinition(fixture);
                const generator = new AlgoliaSearchRecordGenerator({
                    docsDefinition: transformWriteDocsDefinitionToDb({ writeShape: docsDefinition, files: {} }),
                    loadApiDefinition: async (id) => {
                        const apiDef = loadApiDefinition(fixture, id);
                        return transformApiDefinitionForDb(apiDef, id);
                    },
                });
                const records = await generator.generateAlgoliaSearchRecordsForDocs();
                const recordsWithoutIds = records.map((record) => {
                    const { objectID: _, ...rest } = record;
                    return rest;
                });
                expect(recordsWithoutIds).toMatchSnapshot();
            },
            90_000
        );
    }
});
