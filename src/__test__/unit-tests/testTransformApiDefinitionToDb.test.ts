import { APIV1Write } from "../../api";
import { transformApiDefinitionForDb } from "../../converters/db/convertAPIDefinitionToDb";

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
        sdksWithSnippets: [],
    };
    const dbApiDefinition = transformApiDefinitionForDb(apiDefinition, "id");
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
