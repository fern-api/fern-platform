import { SDKSnippetHolder, convertAPIDefinitionToDb } from "@fern-api/fdr-sdk";
import { APIV1Write } from "../../api";

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    snippetsConfigWithSdkId: {},
    snippetTemplatesByEndpoint: {},
    snippetsBySdkIdAndEndpointId: {},
    snippetTemplatesByEndpointId: {},
});

it("api register", async () => {
    const apiDefinition: APIV1Write.ApiDefinition = {
        rootPackage: {
            pointsTo: undefined,
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
    const dbApiDefinition = convertAPIDefinitionToDb(apiDefinition, "id", EMPTY_SNIPPET_HOLDER);
    expect(dbApiDefinition).toEqual({
        auth: undefined,
        id: "id",
        rootPackage: {
            pointsTo: undefined,
            endpoints: [],
            subpackages: [],
            types: ["type_User"],
            webhooks: [],
            websockets: [],
        },
        subpackages: {},
        types: {
            type_User: {
                availability: undefined,
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
        hasMultipleBaseUrls: false,
    });
});
