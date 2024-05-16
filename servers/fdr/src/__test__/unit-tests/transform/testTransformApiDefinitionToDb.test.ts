import { APIV1Write, SDKSnippetHolder, convertAPIDefinitionToDb } from "@fern-api/fdr-sdk";
import { resolve } from "path";

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    snippetsConfigWithSdkId: {},
    snippetTemplatesByEndpoint: {},
    snippetsBySdkIdAndEndpointId: {},
    snippetTemplatesByEndpointId: {},
});

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
    {
        name: "candid",
    },
    {
        name: "realtime",
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
                const dbApiDefinition = convertAPIDefinitionToDb(apiDef, "id", EMPTY_SNIPPET_HOLDER);
                expect(dbApiDefinition).toMatchSnapshot();
            },
            90_000,
        );
    }
});
