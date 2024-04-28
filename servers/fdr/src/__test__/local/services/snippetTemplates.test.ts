import { FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { FernRegistry } from "../../../api/generated";
import { CHAT_COMPLETION_PAYLOAD, CHAT_COMPLETION_SNIPPET } from "../../octo";
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
    await unauthedFdr.templates.register({
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
    const response = await fdr.templates.get({
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

it("generate example from snippet template", async () => {
    const unauthedFdr = getClient({ authed: false, url: inject("url") });
    const fdr = getClient({ authed: true, url: inject("url") });

    const orgId = "octoai";
    const apiId = "api";
    const sdk: FernRegistry.Sdk = {
        type: "python",
        package: "octoai",
        version: "0.0.5",
    };

    // register API definition for acme org
    await unauthedFdr.templates.register({
        orgId,
        apiId,
        apiDefinitionId: "....",
        snippet: CHAT_COMPLETION_SNIPPET,
    });
    // create snippets
    await fdr.templates.get({
        orgId,
        apiId,
        endpointId: CHAT_COMPLETION_SNIPPET.endpointId,
        sdk,
    });

    const response = await fdr.snippets.get({
        orgId,
        apiId,
        endpoint: CHAT_COMPLETION_SNIPPET.endpointId,
        sdks: [sdk],
        payload: CHAT_COMPLETION_PAYLOAD,
    });
    expect(response.ok).toBe(true);
    console.log(JSON.stringify(response, null, 2));
});
