import { loadDocsDefinition } from "@fern-ui/test-utils";
import { getSlugForFirstNavigatableEndpointOrWebhook } from "../../subpackage";

interface Fixture {
    name: string;
    revision: number | string;
}

const FIXTURES: Fixture[] = [
    {
        name: "primer",
        revision: 1,
    },
];

describe("getSlugForFirstNavigatableEndpointOrWebhook()", () => {
    for (const fixture of FIXTURES) {
        it(`${fixture.name}-${fixture.revision}`, async () => {
            const docsDef = loadDocsDefinition(fixture.name, fixture.revision);
            const navigatablesByApiId: Record<string, (string | null)[]> = {};
            Object.values(docsDef.apis).forEach((apiDef) => {
                const navigatables = Object.values(apiDef.subpackages).map(
                    (s) => getSlugForFirstNavigatableEndpointOrWebhook(apiDef, [], s) ?? null
                );
                navigatablesByApiId[apiDef.id] = navigatables;
            });
            expect(navigatablesByApiId).toMatchSnapshot();
        }, 90_000);
    }
});
