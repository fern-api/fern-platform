import { SDKSnippetHolder } from "@fern-api/fdr-sdk";

describe("SDK Snippet Holder", () => {
    it("Test SDK Snippet Retrieval", () => {
        const sdkSnippetHolder = new SDKSnippetHolder({
            snippetsBySdkId: {
                "python|acme|0.0.1": {
                    "/users/v1": {
                        DELETE: [],
                        GET: [
                            {
                                async_client: "client = AsyncAcme(api_key='YOUR_API_KEY')",
                                sdk: { package: "acme", version: "0.0.1" },
                                sync_client: "client = Acme(api_key='YOUR_API_KEY')",
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
        });
        expect(snippet?.async_client).toEqual("client = AsyncAcme(api_key='YOUR_API_KEY')");
    });
});
