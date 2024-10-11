import { DocsV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { createApiDefinition, getAPIResponse, getClient } from "../util";
import { EMPTY_REGISTER_API_DEFINITION } from "./api.test";

it("Load snippets by endpoint id", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register API definition for acme org
    await fdr.api.v1.register.registerApiDefinition({
        orgId: FdrAPI.OrgId("acme"),
        apiId: FdrAPI.ApiId("user"),
        definition: EMPTY_REGISTER_API_DEFINITION,
    });
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: FdrAPI.OrgId("acme"),
        apiId: FdrAPI.ApiId("user"),
        snippets: {
            type: "go",
            sdk: {
                githubRepo: "fern-api/user-go",
                version: "0.0.1",
            },
            snippets: [
                {
                    endpoint: {
                        path: FdrAPI.EndpointPathLiteral("$1"),
                        method: FdrAPI.HttpMethod.Get,
                        identifierOverride: "endpoint_users.list",
                    },
                    snippet: {
                        client: "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
                    },
                    exampleIdentifier: undefined,
                },
            ],
        },
    });

    const response = await fdr.snippets.get({
        orgId: FdrAPI.OrgId("acme"),
        apiId: FdrAPI.ApiId("user"),
        endpoint: {
            path: FdrAPI.EndpointPathLiteral("$1"),
            method: FdrAPI.HttpMethod.Get,
            identifierOverride: "endpoint_users.list",
        },
    });
    expect(response.ok).toBe(true);

    // register API definition for acme org
    const apiDefinitionResponse = getAPIResponse(
        await fdr.api.v1.register.registerApiDefinition({
            orgId: FdrAPI.OrgId("acme"),
            apiId: FdrAPI.ApiId("user"),
            definition: createApiDefinition({
                endpointId: FdrAPI.EndpointId("list"),
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
                    typescriptSdk: undefined,
                    pythonSdk: undefined,
                    javaSdk: undefined,
                    rubySdk: undefined,
                },
            }),
        }),
    );
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: FdrAPI.OrgId("acme"),
            apiId: FdrAPI.ApiId("user"),
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: [],
            filepaths: [DocsV1Write.FilePath("logo.png"), DocsV1Write.FilePath("guides/guide.mdx")],
            images: [],
        }),
    );
    await fdr.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: {
            pages: {},
            config: {
                navigation: {
                    landingPage: undefined,
                    items: [
                        {
                            type: "api",
                            title: "Acme API",
                            api: apiDefinitionResponse.apiDefinitionId,
                            artifacts: undefined,
                            skipUrlSlug: undefined,
                            showErrors: false,
                            changelog: undefined,
                            changelogV2: undefined,
                            navigation: undefined,
                            longScrolling: undefined,
                            flattened: undefined,
                            icon: undefined,
                            hidden: undefined,
                            urlSlugOverride: undefined,
                            fullSlug: undefined,
                        } satisfies DocsV1Write.NavigationItem,
                    ],
                },
                root: undefined,
                title: undefined,
                defaultLanguage: undefined,
                announcement: undefined,
                navbarLinks: undefined,
                footerLinks: undefined,
                logoHeight: undefined,
                logoHref: undefined,
                favicon: undefined,
                metadata: undefined,
                redirects: undefined,
                colorsV3: undefined,
                layout: undefined,
                typographyV2: undefined,
                analyticsConfig: undefined,
                integrations: undefined,
                css: undefined,
                js: undefined,
                playground: undefined,
                backgroundImage: undefined,
                logoV2: undefined,
                logo: undefined,
                colors: undefined,
                colorsV2: undefined,
                typography: undefined,
            },
            jsFiles: undefined,
        },
    });
    // get docs for url
    const docs = getAPIResponse(
        await fdr.docs.v2.read.getDocsForUrl({
            url: FdrAPI.Url("https://acme.docs.buildwithfern.com"),
        }),
    );
    const apiDefinition = docs.definition.apis[apiDefinitionResponse.apiDefinitionId];
    expect(apiDefinition).not.toEqual(undefined);
    expect(apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.goSdk).not.toEqual(undefined);
    expect(apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.goSdk?.client).toEqual(
        "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
    );
});
