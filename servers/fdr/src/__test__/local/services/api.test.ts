import { APIV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { createApiDefinition, getAPIResponse, getClient } from "../util";

export const EMPTY_REGISTER_API_DEFINITION: APIV1Write.ApiDefinition = {
    rootPackage: {
        endpoints: [],
        webhooks: [],
        websockets: [],
        types: [],
        subpackages: [],
        pointsTo: undefined,
    },
    subpackages: {},
    types: {},
    auth: undefined,
    globalHeaders: undefined,
    snippetsConfiguration: undefined,
    navigation: undefined,
};

const MOCK_REGISTER_API_DEFINITION: APIV1Write.ApiDefinition = createApiDefinition({
    endpointId: APIV1Write.EndpointId("dummy"),
    endpointMethod: "POST",
    endpointPath: {
        parts: [{ type: "literal", value: "dummy" }],
        pathParameters: [],
    },
});

it("register api", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register empty definition
    const emptyDefinitionRegisterResponse = getAPIResponse(
        await fdr.api.v1.register.registerApiDefinition({
            orgId: FdrAPI.OrgId("fern"),
            apiId: FdrAPI.ApiId("api"),
            definition: EMPTY_REGISTER_API_DEFINITION,
        }),
    );

    console.log(`Registered empty definition. Received ${emptyDefinitionRegisterResponse.apiDefinitionId}`);
    // load empty definition
    const registeredEmptyDefinition = getAPIResponse(
        await fdr.api.v1.read.getApi(emptyDefinitionRegisterResponse.apiDefinitionId),
    );

    // assert definitions are equal
    expect(JSON.stringify(registeredEmptyDefinition.types)).toEqual(
        JSON.stringify(EMPTY_REGISTER_API_DEFINITION.types),
    );
    expect(JSON.stringify(registeredEmptyDefinition.subpackages)).toEqual(
        JSON.stringify(EMPTY_REGISTER_API_DEFINITION.subpackages),
    );
    expect(registeredEmptyDefinition.rootPackage).toEqual(EMPTY_REGISTER_API_DEFINITION.rootPackage);

    // register updated definition
    const updatedDefinitionRegisterResponse = getAPIResponse(
        await fdr.api.v1.register.registerApiDefinition({
            orgId: FdrAPI.OrgId("fern"),
            apiId: FdrAPI.ApiId("api"),
            definition: MOCK_REGISTER_API_DEFINITION,
        }),
    );
    // load updated definition
    const updatedDefinition = getAPIResponse(
        await fdr.api.v1.read.getApi(updatedDefinitionRegisterResponse.apiDefinitionId),
    );
    // assert definitions equal
    expect(JSON.stringify(updatedDefinition.types)).toEqual(JSON.stringify(MOCK_REGISTER_API_DEFINITION.types));
    expect(JSON.stringify(updatedDefinition.subpackages)).toEqual(
        JSON.stringify(MOCK_REGISTER_API_DEFINITION.subpackages),
    );
});
