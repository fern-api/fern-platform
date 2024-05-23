import { SDKSnippetHolder } from "../converters";

describe("SDK Snippet Holder", () => {
    it("Retrieve by Endpoint ID", () => {
        const sdkSnippetHolder = new SDKSnippetHolder({
            snippetsBySdkIdAndEndpointId: {
                "python|acme|0.0.1": {
                    "endpoint_connectors.list": [
                        {
                            async_client: "client = AsyncAcme0(api_key='YOUR_API_KEY')",
                            sdk: { package: "acme", version: "0.0.1" },
                            sync_client: "client = Acme0(api_key='YOUR_API_KEY')",
                            type: "python",
                        },
                    ],
                },
            },
            snippetTemplatesByEndpointId: {},
            snippetsBySdkId: {
                "python|acme|0.0.1": {
                    "/users/v1": {
                        DELETE: [],
                        GET: [
                            {
                                async_client: "client = AsyncAcme1(api_key='YOUR_API_KEY')",
                                sdk: { package: "acme", version: "0.0.1" },
                                sync_client: "client = Acme1(api_key='YOUR_API_KEY')",
                                type: "python",
                            },
                        ],
                        PATCH: [],
                        POST: [],
                        PUT: [],
                    },
                },
            },
            snippetsConfigWithSdkId: {
                pythonSdk: {
                    package: "acme",
                    sdkId: "python|acme|0.0.1",
                },
            },
            snippetTemplatesByEndpoint: {},
        });
        const snippet = sdkSnippetHolder.getPythonCodeSnippetForEndpoint({
            endpointMethod: "GET",
            endpointPath: "/users/v1",
            endpointId: "endpoint_connectors.list",
            exampleId: undefined,
        });
        expect(snippet?.async_client).toEqual("client = AsyncAcme0(api_key='YOUR_API_KEY')");
    });

    it("Retrieve by Example ID", () => {
        const sdkSnippetHolder = new SDKSnippetHolder({
            snippetsBySdkIdAndEndpointId: {
                "python|acme|0.0.1": {
                    "endpoint_connectors.list": [
                        {
                            async_client: "client = AsyncAcme1(api_key='YOUR_API_KEY')",
                            sdk: { package: "acme", version: "0.0.1" },
                            sync_client: "client = Acme1(api_key='YOUR_API_KEY')",
                            type: "python",
                            exampleIdentifier: "example1",
                        },
                        {
                            async_client: "client = AsyncAcme2(api_key='YOUR_API_KEY')",
                            sdk: { package: "acme", version: "0.0.1" },
                            sync_client: "client = Acme2(api_key='YOUR_API_KEY')",
                            type: "python",
                            exampleIdentifier: "example2",
                        },
                    ],
                },
            },
            snippetTemplatesByEndpointId: {},
            snippetsBySdkId: {},
            snippetsConfigWithSdkId: {
                pythonSdk: {
                    package: "acme",
                    sdkId: "python|acme|0.0.1",
                },
            },
            snippetTemplatesByEndpoint: {},
        });
        const snippet = sdkSnippetHolder.getPythonCodeSnippetForEndpoint({
            endpointMethod: "GET",
            endpointPath: "/users/v1",
            endpointId: "endpoint_connectors.list",
            exampleId: "example2",
        });
        expect(snippet?.async_client).toEqual("client = AsyncAcme2(api_key='YOUR_API_KEY')");
    });
});
