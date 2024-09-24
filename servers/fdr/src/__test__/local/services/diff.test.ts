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

    // register updated definition
    const updatedDefinitionRegisterResponse = getAPIResponse(
        await fdr.api.v1.register.registerApiDefinition({
            orgId: FdrAPI.OrgId("fern"),
            apiId: FdrAPI.ApiId("api"),
            definition: MOCK_REGISTER_API_DEFINITION,
        }),
    );

    const response = getAPIResponse(
        await fdr.diff.diff({
            currentApiDefinitionId: updatedDefinitionRegisterResponse.apiDefinitionId,
            previousApiDefinitionId: emptyDefinitionRegisterResponse.apiDefinitionId,
        }),
    );

    expect(response.markdown.length).toBeGreaterThan(0);
});
