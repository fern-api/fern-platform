import { FdrAPI } from "@fern-api/fdr-sdk";
import { createMockFdrApplication } from "../../mock";

const fdrApplication = createMockFdrApplication({
    orgIds: ["acme", "octoai"],
});

it("snippet api dao", async () => {
    // create snippets
    await fdrApplication.dao.snippets().storeSnippets({
        storeSnippetsInfo: {
            orgId: "example",
            apiId: "bar",
            sdk: {
                type: "python",
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
                            async_client: "invalid",
                            sync_client: "invalid",
                        },
                    },
                ],
            },
        },
    });
    // get snippets with orgId
    const snippetAPIs = await fdrApplication.dao.snippetAPIs().loadSnippetAPIs({
        loadSnippetAPIsRequest: {
            orgIds: ["example", "fern"],
            apiName: undefined,
        },
    });
    expect(snippetAPIs).not.toEqual(undefined);
    expect(snippetAPIs?.length).toEqual(1);

    const snippetAPI = snippetAPIs?.[0];
    expect(snippetAPI).not.toEqual(undefined);
    expect(snippetAPI?.orgId).toEqual("example");
    expect(snippetAPI?.apiName).toEqual("bar");

    // get snippets with orgId and apiId
    const sameSnippetAPIs = await fdrApplication.dao.snippetAPIs().loadSnippetAPIs({
        loadSnippetAPIsRequest: {
            orgIds: ["example", "fern"],
            apiName: "bar",
        },
    });
    expect(sameSnippetAPIs).not.toEqual(undefined);
    expect(sameSnippetAPIs?.length).toEqual(1);

    const sameSnippetAPI = snippetAPIs?.[0];
    expect(sameSnippetAPI).not.toEqual(undefined);
    expect(sameSnippetAPI?.orgId).toEqual("example");
    expect(sameSnippetAPI?.apiName).toEqual("bar");
});

it("snippets dao", async () => {
    // create snippets
    await fdrApplication.dao.snippets().storeSnippets({
        storeSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            sdk: {
                type: "python",
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
                            async_client: "invalid",
                            sync_client: "invalid",
                        },
                    },
                ],
            },
        },
    });
    // overwrite snippets for the same SDK
    await fdrApplication.dao.snippets().storeSnippets({
        storeSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            sdk: {
                type: "python",
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
                            async_client: "client = AsyncAcme(api_key='YOUR_API_KEY')",
                            sync_client: "client = Acme(api_key='YOUR_API_KEY')",
                        },
                    },
                ],
            },
        },
    });
    await fdrApplication.dao.snippets().storeSnippets({
        storeSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            sdk: {
                type: "python",
                sdk: {
                    package: "acme",
                    version: "0.0.2",
                },
                snippets: [
                    {
                        endpoint: {
                            path: "/users/v1",
                            method: FdrAPI.EndpointMethod.Get,
                        },
                        snippet: {
                            async_client: "client = AsyncAcme(api_key='YOUR_API_KEY')",
                            sync_client: "client = Acme(api_key='YOUR_API_KEY')",
                        },
                    },
                ],
            },
        },
    });
    // get snippets
    const response = await fdrApplication.dao.snippets().loadSnippetsPage({
        loadSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            endpointIdentifier: {
                path: "/users/v1",
                method: FdrAPI.EndpointMethod.Get,
            },
            sdks: undefined,
            page: undefined,
            exampleIdentifier: undefined,
        },
    });
    expect(response).not.toEqual(undefined);
    console.log("broo", JSON.stringify(response, null, 2));
    expect(Object.keys(response?.snippets ?? {}).length).toEqual(1);

    const snippets = response?.snippets["/users/v1"]?.GET;
    if (snippets === undefined) {
        throw new Error("snippets were undefined");
    }
    expect(snippets).not.toEqual(undefined);
    expect(snippets.length).toEqual(2);

    const snippet = snippets[0];
    if (snippet === undefined) {
        throw new Error("snippet was undefined");
    }
    expect(snippet).not.toEqual(undefined);
    expect(snippet.type).toEqual("python");

    if (snippet.type != "python") {
        throw new Error("expected a python snippet");
    }
    expect(snippet.sdk.package).toEqual("acme");
    expect(snippet.sdk.version).toEqual("0.0.2");
    expect(snippet.async_client).toEqual("client = AsyncAcme(api_key='YOUR_API_KEY')");
    expect(snippet.sync_client).toEqual("client = Acme(api_key='YOUR_API_KEY')");

    const sdkId = await fdrApplication.dao.sdks().getSdkIdForPackage({ sdkPackage: "acme", language: "PYTHON" });
    expect(sdkId).toEqual("python|acme|0.0.2");

    const sdkIdPrevious = await fdrApplication.dao
        .sdks()
        .getSdkIdForPackage({ sdkPackage: "acme", language: "PYTHON", version: "0.0.1" });
    expect(sdkIdPrevious).toEqual("python|acme|0.0.1");

    const snippetsForSdkId = await fdrApplication.dao.snippets().loadAllSnippetsForSdkIds(sdkId != null ? [sdkId] : []);
    expect(snippetsForSdkId).toEqual({
        "python|acme|0.0.2": {
            "/users/v1": {
                DELETE: [],
                GET: [
                    {
                        async_client: "client = AsyncAcme(api_key='YOUR_API_KEY')",
                        sdk: { package: "acme", version: "0.0.2" },
                        sync_client: "client = Acme(api_key='YOUR_API_KEY')",
                        type: "python",
                    },
                ],
                PATCH: [],
                POST: [],
                PUT: [],
            },
        },
    });
});

it("snippets dao with example id", async () => {
    // create snippets
    await fdrApplication.dao.snippets().storeSnippets({
        storeSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            sdk: {
                type: "python",
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
                            async_client: "invalid",
                            sync_client: "invalid",
                        },
                        exampleIdentifier: "example1",
                    },
                ],
            },
        },
    });
    await fdrApplication.dao.snippets().storeSnippets({
        storeSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            sdk: {
                type: "python",
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
                            async_client: "client = AsyncAcme(api_key='YOUR_API_KEY')",
                            sync_client: "client = Acme(api_key='YOUR_API_KEY')",
                        },
                        exampleIdentifier: "example2",
                    },
                ],
            },
        },
    });
    // get snippets
    const response = await fdrApplication.dao.snippets().loadSnippetsPage({
        loadSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            endpointIdentifier: {
                path: "/users/v1",
                method: FdrAPI.EndpointMethod.Get,
            },
            sdks: undefined,
            page: undefined,
            exampleIdentifier: "example1",
        },
    });
    expect(response).not.toEqual(undefined);
    expect(Object.keys(response?.snippets ?? {}).length).toEqual(1);

    const snippets = response?.snippets["/users/v1"]?.GET;
    if (snippets === undefined) {
        throw new Error("snippets were undefined");
    }
    expect(snippets).not.toEqual(undefined);
    expect(snippets.length).toEqual(1);

    const snippet = snippets[0];
    if (snippet === undefined) {
        throw new Error("snippet was undefined");
    }
    expect(snippet).not.toEqual(undefined);
    expect(snippet.type).toEqual("python");

    if (snippet.type != "python") {
        throw new Error("expected a python snippet");
    }
    expect(snippet.sdk.package).toEqual("acme");
    expect(snippet.sdk.version).toEqual("0.0.1");
    expect(snippet.async_client).toEqual("invalid");
    expect(snippet.sync_client).toEqual("invalid");

    const response2 = await fdrApplication.dao.snippets().loadSnippetsPage({
        loadSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            endpointIdentifier: {
                path: "/users/v1",
                method: FdrAPI.EndpointMethod.Get,
            },
            sdks: undefined,
            page: undefined,
            exampleIdentifier: "example2",
        },
    });
    expect(response2).not.toEqual(undefined);
    expect(Object.keys(response2?.snippets ?? {}).length).toEqual(1);

    const snippets2 = response2?.snippets["/users/v1"]?.GET;
    if (snippets2 === undefined) {
        throw new Error("snippets2 were undefined");
    }
    expect(snippets2).not.toEqual(undefined);
    expect(snippets2.length).toEqual(1);

    const snippet2 = snippets2[0];
    if (snippet2 === undefined) {
        throw new Error("snippet2 was undefined");
    }
    expect(snippet2).not.toEqual(undefined);
    expect(snippet2.type).toEqual("python");

    if (snippet2.type != "python") {
        throw new Error("expected a python snippet2");
    }
    expect(snippet2.sdk.package).toEqual("acme");
    expect(snippet2.sdk.version).toEqual("0.0.1");
    expect(snippet2.async_client).toEqual("client = AsyncAcme(api_key='YOUR_API_KEY')");
    expect(snippet2.sync_client).toEqual("client = Acme(api_key='YOUR_API_KEY')");
});

it("snippets template", async () => {
    await fdrApplication.dao.snippetTemplates().storeSnippetTemplate({
        storeSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            apiDefinitionId: "....",
            snippets: [
                {
                    sdk: {
                        type: "python",
                        package: "acme",
                        version: "0.0.1",
                    },
                    endpointId: {
                        path: "/users/v1",
                        method: FdrAPI.EndpointMethod.Get,
                    },
                    snippetTemplate: {
                        type: "v1",
                        clientInstantiation: "",
                        functionInvocation: {
                            type: "generic",
                            isOptional: false,
                            templateString: "",
                        },
                    },
                },
                {
                    sdk: {
                        type: "typescript",
                        package: "acme",
                        version: "0.0.1",
                    },
                    endpointId: {
                        path: "/users/v1",
                        method: FdrAPI.EndpointMethod.Get,
                    },
                    snippetTemplate: {
                        type: "v1",
                        clientInstantiation: "",
                        functionInvocation: {
                            type: "generic",
                            isOptional: false,
                            templateString: "",
                        },
                    },
                },
            ],
        },
    });

    const response = await fdrApplication.dao.snippetTemplates().loadSnippetTemplate({
        loadSnippetTemplateRequest: {
            orgId: "acme",
            apiId: "api",
            endpointId: {
                path: "/users/v1",
                method: FdrAPI.EndpointMethod.Get,
            },
            sdk: {
                type: "python",
                package: "acme",
                version: "0.0.1",
            },
        },
    });

    expect(response).not.toEqual(null);
    expect(response).toEqual({
        endpointId: { path: "/users/v1", method: "GET" },
        sdk: { type: "python", package: "acme", version: "0.0.1" },
        snippetTemplate: {
            type: "v1",
            functionInvocation: { type: "generic", isOptional: false, templateString: "" },
            clientInstantiation: "",
        },
    });

    const response2 = await fdrApplication.dao.snippetTemplates().loadSnippetTemplatesByEndpoint({
        orgId: "acme",
        apiId: "api",
        sdkRequests: [
            {
                type: "python",
                package: "acme",
            },
            {
                type: "typescript",
                package: "acme",
            },
        ],
        definition: {
            rootPackage: {
                endpoints: [
                    {
                        id: "getUsers",
                        path: {
                            parts: [{ type: "literal", value: "/users/v1" }],
                            pathParameters: [],
                        },
                        method: "GET",
                        queryParameters: [],
                        headers: [],
                        examples: [],
                    },
                ],
                types: [],
                subpackages: [],
            },
            types: {},
            subpackages: {},
        },
    });

    expect(response2).toEqual({
        "/users/v1": {
            PATCH: {},
            POST: {},
            PUT: {},
            GET: {
                typescript: {
                    type: "v1",
                    functionInvocation: {
                        type: "generic",
                        isOptional: false,
                        templateString: "",
                    },
                    clientInstantiation: "",
                },
            },
            DELETE: {},
        },
    });

    const response3 = await fdrApplication.dao.snippetTemplates().loadSnippetTemplatesByEndpoint({
        orgId: "acme",
        apiId: "api",
        sdkRequests: [
            {
                type: "go",
                githubRepo: "",
            },
        ],
        definition: {
            rootPackage: {
                endpoints: [
                    {
                        id: "getUsers",
                        path: {
                            parts: [{ type: "literal", value: "/users/v1" }],
                            pathParameters: [],
                        },
                        method: "GET",
                        queryParameters: [],
                        headers: [],
                        examples: [],
                    },
                ],
                types: [],
                subpackages: [],
            },
            types: {},
            subpackages: {},
        },
    });

    expect(response3).toEqual({});
});
