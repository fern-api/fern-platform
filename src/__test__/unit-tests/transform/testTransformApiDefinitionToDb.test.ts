import { resolve } from "path";
import { transformApiDefinitionForDb } from "../../../controllers/api/registerToDbConversion/transformApiDefinitionToDb";
import type * as FernRegistryApiWrite from "../../generated/api/resources/api/resources/v1/resources/register";

const FIXTURES_DIR = resolve(__dirname, "fixtures");
const FIXTURES: Fixture[] = [
    {
        name: "cyclical-1",
    },
    {
        name: "vellum",
    },
];

function loadFdrApiDefinition(fixture: Fixture) {
    const filePath = resolve(FIXTURES_DIR, fixture.name, "fdr.json");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath) as FernRegistryApiWrite.ApiDefinition;
}

interface Fixture {
    name: string;
    only?: boolean;
}

describe("transformApiDefinitionToDb", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const apiDef = loadFdrApiDefinition(fixture);
                const dbApiDefinition = transformApiDefinitionForDb(apiDef, "id");
                expect(dbApiDefinition).toMatchSnapshot();
            },
            90_000
        );
    }
});
