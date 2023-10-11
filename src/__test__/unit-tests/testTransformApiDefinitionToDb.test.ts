import { SDKSnippetHolder } from "../../converters/db/snippets/SDKSnippetHolder";
import { APIV1Write } from "../../api";
import { transformApiDefinitionForDb } from "../../converters/db/convertAPIDefinitionToDb";

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    packageToSdkId: {},
    snippetsConfiguration: {},
});

it("api register", async () => {
    const apiDefinition: APIV1Write.ApiDefinition = {
        rootPackage: {
            endpoints: [],
            subpackages: [],
            types: ["type_User"],
        },
        types: {
            type_User: {
                description: "This is some ```markdown```",
                name: "User",
                shape: {
                    type: "alias",
                    value: {
                        type: "primitive",
                        value: {
                            type: "string",
                        },
                    },
                },
            },
        },
        subpackages: {},
    };
    const dbApiDefinition = transformApiDefinitionForDb(apiDefinition, "id", EMPTY_SNIPPET_HOLDER);
    expect(dbApiDefinition).toEqual({
        auth: undefined,
        id: "id",
        rootPackage: {
            endpoints: [],
            subpackages: [],
            types: ["type_User"],
            webhooks: [],
        },
        subpackages: {},
        types: {
            type_User: {
                description: "This is some ```markdown```",
                htmlDescription: "<p>This is some <code>markdown</code></p>\n",
                descriptionContainsMarkdown: true,
                name: "User",
                shape: {
                    type: "alias",
                    value: {
                        type: "primitive",
                        value: {
                            type: "string",
                        },
                    },
                },
            },
        },
        hasMultipleBaseUrls: false,
    });
});
