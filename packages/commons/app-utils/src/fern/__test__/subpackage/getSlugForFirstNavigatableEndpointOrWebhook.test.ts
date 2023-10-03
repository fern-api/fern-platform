import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { resolve } from "path";
import { getSlugForFirstNavigatableEndpointOrWebhook } from "../../subpackage";

const FIXTURES_DIR = resolve(__dirname, "fixtures");
const FIXTURES: Fixture[] = [
    {
        name: "primer-v2.1",
    },
    {
        name: "primer-v2.2",
    },
];

function loadFdrApiDefinition(fixture: Fixture): FernRegistryApiRead.ApiDefinition {
    const filePath = resolve(FIXTURES_DIR, fixture.name, "fdr.json");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath) as FernRegistryApiRead.ApiDefinition;
}

interface Fixture {
    name: string;
    only?: boolean;
}

describe("getSlugForFirstNavigatableEndpointOrWebhook()", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const apiDef = loadFdrApiDefinition(fixture);
                const navigatables = Object.values(apiDef.subpackages).map(
                    (s) => getSlugForFirstNavigatableEndpointOrWebhook(apiDef, [], s) ?? null
                );
                // eslint-disable-next-line jest/no-standalone-expect
                expect(navigatables).toMatchSnapshot();
            },
            90_000
        );
    }
});
