import { FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { DEFAULT_SNIPPETS_PAGE_SIZE } from "../../../db/snippets/SnippetsDao";
import { createApiDefinition, getAPIResponse, getClient } from "../util";
import { EMPTY_REGISTER_API_DEFINITION } from "./api.test";
import { FONT_FILE_ID } from "./docs.test";

it("get snippets", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: "acme",
        apiId: "foo",
        snippets: {
            type: "python",
            sdk: {
                package: "acme",
                version: "0.0.2",
            },
            snippets: [
                {
                    endpoint: {
                        path: "/snippets/load",
                        method: FdrAPI.EndpointMethod.Post,
                    },
                    snippet: {
                        async_client: "const petstore = new AsyncPetstoreClient(\napi_key='YOUR_API_KEY',\n)",
                        sync_client: "const petstore = new PetstoreClient(\napi_key='YOUR_API_KEY',\n)",
                    },
                },
            ],
        },
    });
    // get snippets
    const snippets = getAPIResponse(
        await fdr.get({
            orgId: "acme",
            apiId: "foo",
            endpoint: {
                path: "/snippets/load",
                method: FdrAPI.EndpointMethod.Post,
            },
        }),
    );
    expect(snippets.length).toEqual(1);

    const snippet = snippets[0] as FdrAPI.PythonSnippet;
    expect(snippet.sdk.package).toEqual("acme");
    expect(snippet.sdk.version).toEqual("0.0.2");
    expect(snippet.async_client).toEqual("const petstore = new AsyncPetstoreClient(\napi_key='YOUR_API_KEY',\n)");
    expect(snippet.sync_client).toEqual("const petstore = new PetstoreClient(\napi_key='YOUR_API_KEY',\n)");
    // register API definition for acme org
    const apiDefinitionResponse = getAPIResponse(
        await fdr.api.v1.register.registerApiDefinition({
            orgId: "acme",
            apiId: "foo",
            definition: createApiDefinition({
                endpointId: "/snippets/load",
                endpointMethod: "POST",
                endpointPath: {
                    parts: [
                        { type: "literal", value: "/snippets" },
                        { type: "literal", value: "/load" },
                    ],
                    pathParameters: [],
                },
                snippetsConfig: {
                    pythonSdk: {
                        package: "acme",
                    },
                },
            }),
        }),
    );
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "foo",
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
                typography: {
                    headingsFont: {
                        name: "Syne",
                        fontFile: FONT_FILE_ID,
                    },
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
    expect(apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.pythonSdk).not.toEqual(undefined);
    expect(apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.pythonSdk?.async_client).toEqual(
        "const petstore = new AsyncPetstoreClient(\napi_key='YOUR_API_KEY',\n)",
    );
    expect(apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.pythonSdk?.sync_client).toEqual(
        "const petstore = new PetstoreClient(\napi_key='YOUR_API_KEY',\n)",
    );
});

it("get Go snippets", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: "acme",
        apiId: "echo",
        snippets: {
            type: "go",
            sdk: {
                githubRepo: "https://github.com/acme/acme-go",
                version: "0.0.10",
            },
            snippets: [
                {
                    endpoint: {
                        path: "/snippets/load",
                        method: FdrAPI.EndpointMethod.Post,
                    },
                    snippet: {
                        client: "client := acmeclient.NewClient()\n",
                    },
                },
            ],
        },
    });
    // get snippets
    const snippets = getAPIResponse(
        await fdr.get({
            apiId: "echo",
            orgId: "acme",
            endpoint: {
                path: "/snippets/load",
                method: FdrAPI.EndpointMethod.Post,
            },
        }),
    );
    expect(snippets.length).toEqual(1);

    const snippet = snippets[0] as FdrAPI.GoSnippet;
    expect(snippet.sdk.githubRepo).toEqual("https://github.com/acme/acme-go");
    expect(snippet.sdk.version).toEqual("0.0.10");
    expect(snippet.client).toEqual("client := acmeclient.NewClient()\n");
    // register API definition for acme org
    const apiDefinitionResponse = getAPIResponse(
        await fdr.api.v1.register.registerApiDefinition({
            orgId: "acme",
            apiId: "echo",
            definition: createApiDefinition({
                endpointId: "/snippets/load",
                endpointMethod: "POST",
                endpointPath: {
                    parts: [
                        { type: "literal", value: "/snippets" },
                        { type: "literal", value: "/load" },
                    ],
                    pathParameters: [],
                },
                snippetsConfig: {
                    goSdk: {
                        githubRepo: "https://github.com/acme/acme-go",
                    },
                },
            }),
        }),
    );
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await fdr.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "echo",
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
                typography: {
                    headingsFont: {
                        name: "Syne",
                        fontFile: FONT_FILE_ID,
                    },
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
        "client := acmeclient.NewClient()\n",
    );
});

it("get snippets with unregistered API", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: "acme",
        apiId: "fresh",
        snippets: {
            type: "typescript",
            sdk: {
                package: "acme",
                version: "0.0.1",
            },
            snippets: [
                {
                    endpoint: {
                        path: "/users/v1",
                        method: FdrAPI.EndpointMethod.Get,
                    },
                    snippet: {
                        client: "const petstore = new PetstoreClient({\napiKey: 'YOUR_API_KEY',\n});",
                    },
                },
            ],
        },
    });
    // get snippets
    const snippets = getAPIResponse(
        await fdr.get({
            orgId: "acme",
            apiId: "fresh",
            endpoint: {
                path: "/users/v1",
                method: FdrAPI.EndpointMethod.Get,
            },
        }),
    );
    expect(snippets.length).toEqual(1);

    const snippet = snippets[0] as FdrAPI.TypeScriptSnippet;
    expect(snippet.sdk.package).toEqual("acme");
    expect(snippet.sdk.version).toEqual("0.0.1");
    expect(snippet.client).toEqual("const petstore = new PetstoreClient({\napiKey: 'YOUR_API_KEY',\n});");
});

it("load snippets", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // register API definition for acme org
    await fdr.api.v1.register.registerApiDefinition({
        orgId: "acme",
        apiId: "user",
        definition: EMPTY_REGISTER_API_DEFINITION,
    });
    // initialize enough snippets to occupy two pages
    const snippets: FdrAPI.SingleTypescriptSnippetCreate[] = [];
    for (let i = 0; i < DEFAULT_SNIPPETS_PAGE_SIZE * 2; i++) {
        snippets.push({
            endpoint: {
                path: `/users/v${i}`,
                method: FdrAPI.EndpointMethod.Get,
            },
            snippet: {
                client: `const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`,
            },
        });
    }
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: "acme",
        apiId: "petstore",
        snippets: {
            type: "typescript",
            sdk: {
                package: "acme",
                version: "0.0.1",
            },
            snippets,
        },
    });

    // load snippets (first page)
    const firstResponse = getAPIResponse(
        await fdr.load({
            orgId: "acme",
            apiId: "petstore",
        }),
    );
    expect(firstResponse.next).toEqual(2);
    expect(Object.keys(firstResponse.snippets).length).toEqual(DEFAULT_SNIPPETS_PAGE_SIZE);

    for (let i = 0; i < DEFAULT_SNIPPETS_PAGE_SIZE; i++) {
        const snippetsForEndpointMethod = firstResponse.snippets[`/users/v${i}`];
        const responseSnippets = snippetsForEndpointMethod?.GET;
        expect(responseSnippets?.length).toEqual(1);
        if (responseSnippets === undefined) {
            throw new Error("response snippets must not be undefined");
        }
        const snippet = responseSnippets[0] as FdrAPI.TypeScriptSnippet;
        expect(snippet.sdk.package).toEqual("acme");
        expect(snippet.sdk.version).toEqual("0.0.1");
        expect(snippet.client).toEqual(`const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`);
    }

    // load snippets (second page)
    const secondResponse = getAPIResponse(
        await fdr.load({
            orgId: "acme",
            apiId: "petstore",
            sdks: [
                {
                    type: "typescript",
                    package: "acme",
                    version: "0.0.1",
                },
            ],
            page: firstResponse.next,
        }),
    );
    expect(Object.keys(secondResponse.snippets).length).toEqual(DEFAULT_SNIPPETS_PAGE_SIZE);

    for (let i = DEFAULT_SNIPPETS_PAGE_SIZE; i < DEFAULT_SNIPPETS_PAGE_SIZE * 2; i++) {
        const snippetsForEndpointMethod = secondResponse.snippets[`/users/v${i}`];
        const responseSnippets = snippetsForEndpointMethod?.GET;
        expect(responseSnippets?.length).toEqual(1);
        if (responseSnippets === undefined) {
            throw new Error("response snippets must not be undefined");
        }
        const snippet = responseSnippets[0] as FdrAPI.TypeScriptSnippet;
        expect(snippet.sdk.package).toEqual("acme");
        expect(snippet.sdk.version).toEqual("0.0.1");
        expect(snippet.client).toEqual(`const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`);
    }
    expect(secondResponse.next).toEqual(3);
});

it("user not part of org", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: "private",
        apiId: "baz",
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
                        method: FdrAPI.EndpointMethod.Get,
                    },
                    snippet: {
                        client: "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
                    },
                },
            ],
        },
    });
    // get snippets
    const response = await fdr.get({
        orgId: "private",
        endpoint: {
            path: "/users/v1",
            method: FdrAPI.EndpointMethod.Get,
        },
    });
    console.log("bruh", JSON.stringify(response));

    expect(response.ok === false).toBe(true);
});

it("snippets apiId not found", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });
    // create snippets
    await fdr.snippetsFactory.createSnippetsForSdk({
        orgId: "acme",
        apiId: "petstore",
        snippets: {
            type: "typescript",
            sdk: {
                package: "acme",
                version: "0.0.1",
            },
            snippets: [
                {
                    endpoint: {
                        path: "/users/v1",
                        method: FdrAPI.EndpointMethod.Get,
                    },
                    snippet: {
                        client: "const acme = new AcmeClient({\napiKey: 'YOUR_API_KEY',\n});",
                    },
                },
            ],
        },
    });

    // get not found apiId
    const response = await fdr.get({
        orgId: "acme",
        apiId: "dne",
        endpoint: {
            path: "/users/v1",
            method: FdrAPI.EndpointMethod.Get,
        },
    });
    expect(response.ok === false).toBe(true);
});

it("get snippets (unauthenticated)", async () => {
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
                        method: FdrAPI.EndpointMethod.Get,
                    },
                    snippet: {
                        client: "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
                    },
                },
            ],
        },
    });
    // get snippets
    const unauthedFdr = getClient({ authed: false, url: inject("url") });
    const response = await unauthedFdr.get({
        orgId: "acme",
        apiId: "user",
        endpoint: {
            path: "/users/v1",
            method: FdrAPI.EndpointMethod.Get,
        },
    });
    expect(response.ok).toBe(false);
});
