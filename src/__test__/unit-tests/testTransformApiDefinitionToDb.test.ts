import { transformApiDefinitionForDb } from "../../controllers/api/registerToDbConversion/transformApiDefinitionToDb";
import * as FernRegistryApiWrite from "../../generated/api/resources/api/resources/v1/resources/register";

it("api register", async () => {
    const apiDefinition: FernRegistryApiWrite.ApiDefinition = {
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
