import { getSlugForFirstNavigatableEndpointOrWebhook } from "@fern-ui/app-utils";
import { loadDocsDefinition } from "@fern-ui/test-utils";
import { type Fixture } from "./commons";

const FIXTURES: Fixture[] = [
    {
        type: "untabbed-versioned",
        name: "primer",
        revision: 1,
        activeVersionId: "v2.2",
    },
];

describe("getSlugForFirstNavigatableEndpointOrWebhook()", () => {
    for (const fixture of FIXTURES) {
        it(`${fixture.name}-${fixture.revision}`, async () => {
            const docsDefinition = loadDocsDefinition(fixture.name, fixture.revision);
            if (docsDefinition == null) {
                throw new Error("Fixture docs definition does not exist.");
            }
            const navigatablesByApiId: Record<string, (string | undefined)[]> = {};
            await Promise.all(
                Object.values(docsDefinition.apis).map(async (apiDef) => {
                    Object.values(apiDef.subpackages).forEach(async (s) => {
                        const navigatableSlug = getSlugForFirstNavigatableEndpointOrWebhook(apiDef, [], s);
                        const navigatablesForApiDef = navigatablesByApiId[apiDef.id] ?? [];
                        navigatablesForApiDef.push(navigatableSlug);
                        navigatablesByApiId[apiDef.id] = navigatablesForApiDef;
                    });
                })
            );
            expect(navigatablesByApiId).toMatchSnapshot();
        }, 90_000);
    }
});
