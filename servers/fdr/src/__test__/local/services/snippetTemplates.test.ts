import { FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { getClient } from "../util";
import { EMPTY_REGISTER_API_DEFINITION } from "./api.test";

const ENDPOINT: FdrAPI.EndpointIdentifier = {
    path: "/users/v1",
    method: "GET",
};
const SDK: FdrAPI.Sdk = {
    type: "go",
    githubRepo: "https://github.com/users-api/users-go",
    version: "0.0.15",
};

it("create snippet template", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register API definition for acme org
    await fdr.api.v1.register.registerApiDefinition({
        orgId: "acme",
        apiId: "user",
        definition: EMPTY_REGISTER_API_DEFINITION,
    });

    // register API definition for acme org
    await fdr.template.register({
        orgId: "acme",
        apiId: "user",
        apiDefinitionId: "....",
        snippet: {
            endpointId: ENDPOINT,
            sdk: SDK,
            snippetTemplate: {
                type: "v1",
                clientInstantiation: "client := userclient.New()",
                functionInvocation: {
                    type: "generic",
                    templateString: "client.GetUsers()",
                    isOptional: false,
                },
            },
        },
    });
    // create snippets
    const response = await fdr.template.get({
        orgId: "acme",
        apiId: "user",
        endpointId: ENDPOINT,
        sdk: SDK,
    });
    expect(response.ok).toBe(true);
    if (!response.ok) {
        throw new Error("Failed to load snippet template");
    }
    expect(response.body.endpointId).toEqual(ENDPOINT);
});
