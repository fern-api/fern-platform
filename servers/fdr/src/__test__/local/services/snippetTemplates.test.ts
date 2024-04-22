import { FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { getClient } from "../util";

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
    const unauthedFdr = getClient({ authed: false, url: inject("url") });
    const fdr = getClient({ authed: true, url: inject("url") });

    const orgId = "acme";

    // register API definition for acme org
    await unauthedFdr.template.register({
        orgId,
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
        orgId,
        apiId: "user",
        endpointId: ENDPOINT,
        sdk: SDK,
    });
    console.log(JSON.stringify(response, null, 2));
    expect(response.ok).toBe(true);
    if (!response.ok) {
        throw new Error("Failed to load snippet template");
    }
    expect(response.body.endpointId).toEqual(ENDPOINT);
});
