import { resolve } from "path";
import { transformApiDefinitionForDb } from "../../../converters/db/convertAPIDefinitionToDb";
import type * as APIV1Write from "../../generated/api/resources/api/resources/v1/resources/register";

const FIXTURES_DIR = resolve(__dirname, "fixtures");
const FIXTURES: Fixture[] = [
    {
        name: "cyclical-1",
    },
    {
        name: "vellum",
    },
    {
        name: "string",
    },
];

function loadFdrApiDefinition(fixture: Fixture) {
    const filePath = resolve(FIXTURES_DIR, fixture.name, "fdr.json");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath) as APIV1Write.ApiDefinition;
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
