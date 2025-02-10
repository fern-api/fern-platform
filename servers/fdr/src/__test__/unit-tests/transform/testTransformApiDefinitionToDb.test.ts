import { resolve } from "path";

import {
  APIV1Write,
  FdrAPI,
  SDKSnippetHolder,
  convertAPIDefinitionToDb,
} from "@fern-api/fdr-sdk";

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
      JSON.stringify(fixture),
      async () => {
        const apiDef = loadFdrApiDefinition(fixture);
        const dbApiDefinition = convertAPIDefinitionToDb(
          apiDef,
          FdrAPI.ApiDefinitionId("id"),
          EMPTY_SNIPPET_HOLDER
        );
        expect(dbApiDefinition).toMatchSnapshot();
      },
      90_000
    );
  }
});
