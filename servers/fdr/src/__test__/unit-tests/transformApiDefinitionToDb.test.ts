import { APIV1Write, FdrAPI, SDKSnippetHolder, convertAPIDefinitionToDb } from "@fern-api/fdr-sdk";

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
            types: [APIV1Write.TypeId("type_User")],
            websockets: undefined,
            webhooks: undefined,
        },
        types: {
            [APIV1Write.TypeId("type_User")]: {
                description: "This is some ```markdown```",
                name: "User",
                shape: {
                    type: "alias",
                    value: {
                        type: "primitive",
                        value: {
                            type: "string",
                            regex: undefined,
                            minLength: undefined,
                            maxLength: undefined,
                            default: undefined,
                        },
                    },
                },
                availability: undefined,
            },
        },
        subpackages: {},
        auth: undefined,
        globalHeaders: undefined,
        snippetsConfiguration: undefined,
        navigation: undefined,
    };
    const dbApiDefinition = convertAPIDefinitionToDb(apiDefinition, FdrAPI.ApiDefinitionId("id"), EMPTY_SNIPPET_HOLDER);
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
