import { resolve } from "path";
import { APIV1Write } from "../../../api";
import { transformApiDefinitionForDb } from "../../../converters/db/convertAPIDefinitionToDb";
import { getSubpackageParentSlugs } from "../../../util/fern/db/subpackage";

const FIXTURES_DIR = resolve(__dirname, "fixtures");
const FIXTURES: Fixture[] = [
    {
        name: "fdr",
    },
    {
        name: "revert",
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

describe("getSubpackageParentSlugs", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const apiDef = loadFdrApiDefinition(fixture);
                const dbApiDefinition = transformApiDefinitionForDb(apiDef, "id");
                const subpackageIdToParentSlugs: Record<string, string[]> = {};
                Object.entries(dbApiDefinition.subpackages).forEach(([subpackageId, subpackage]) => {
                    subpackageIdToParentSlugs[subpackageId] = getSubpackageParentSlugs(subpackage, dbApiDefinition);
                });
                expect(subpackageIdToParentSlugs).toMatchSnapshot();
            },
            90_000
        );
    }
});
