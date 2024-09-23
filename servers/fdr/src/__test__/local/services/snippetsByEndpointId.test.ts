import { FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { createApiDefinition, getAPIResponse, getClient } from "../util";
import { EMPTY_REGISTER_API_DEFINITION } from "./api.test";

it("Load snippets by endpoint id", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register API definition for acme org
    await fdr.api.v1.register.registerApiDefinition({
        orgId: "acme",
        apiId: "user",
        definition: EMPTY_REGISTER_API_DEFINITION,
    });
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: "acme",
        apiId: "user",
        snippets: {
            type: "go",
            sdk: {
                githubRepo: "fern-api/user-go",
                version: "0.0.1",
            },
            snippets: [
                {
                    endpoint: {
                        path: "/users/v1",
                        method: FdrAPI.HttpMethod.Get,
                        identifierOverride: "endpoint_users.list",
                    },
                    snippet: {
                        client: "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
                    },
                },
            ],
        },
    });

    const response = await fdr.snippets.get({
        orgId: "acme",
        apiId: "user",
        endpoint: {
            path: "/users/v1",
            method: FdrAPI.HttpMethod.Get,
            identifierOverride: "endpoint_users.list",
        },
    });
    expect(response.ok).toBe(true);

    // register API definition for acme org
    const apiDefinitionResponse = getAPIResponse(
        await fdr.api.v1.register.registerApiDefinition({
            orgId: "acme",
            apiId: "user",
            definition: createApiDefinition({
                endpointId: "list",
                originalEndpointId: "endpoint_users.list",
                endpointMethod: "POST", // intentionally post to make sure that match happens from originalEndpointId
                endpointPath: {
                    parts: [{ type: "literal", value: "/users/v1" }],
                    pathParameters: [],
                },
                snippetsConfig: {
                    goSdk: {
                        githubRepo: "fern-api/user-go",
                        version: "0.0.1",
                    },
                },
            }),
        }),
    );
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "user",
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: [],
            filepaths: ["logo.png", "guides/guide.mdx"],
            images: [],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: {
            pages: {},
            config: {
                navigation: {
                    items: [
                        {
                            type: "api",
                            title: "Acme API",
                            api: apiDefinitionResponse.apiDefinitionId,
                        },
                    ],
                },
            },
        },
    });
    // get docs for url
    const docs = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: "https://acme.docs.buildwithfern.com",
        }),
    );
    const apiDefinition = docs.definition.apis[apiDefinitionResponse.apiDefinitionId];
    expect(apiDefinition).not.toEqual(undefined);
    expect(apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.goSdk).not.toEqual(undefined);
    expect(apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.goSdk?.client).toEqual(
        "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
    );
});
