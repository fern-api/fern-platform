import { FdrAPI } from "@fern-api/fdr-sdk";

import { createMockFdrApplication } from "../../mock";

const fdrApplication = createMockFdrApplication({
  orgIds: ["acme", "octoai"],
});

it("snippet api dao", async () => {
  // create snippets
  await fdrApplication.dao.snippets().storeSnippets({
    storeSnippetsInfo: {
      orgId: FdrAPI.OrgId("example"),
      apiId: FdrAPI.ApiId("bar"),
      sdk: {
        type: "python",
        sdk: {
          package: "acme",
          version: "0.0.1",
        },
        snippets: [
          {
            endpoint: {
              path: FdrAPI.EndpointPathLiteral("/users/v1"),
              method: FdrAPI.HttpMethod.Get,
              identifierOverride: undefined,
            },
            snippet: {
              async_client: "invalid",
              sync_client: "invalid",
            },
            exampleIdentifier: undefined,
          },
        ],
      },
    },
  });
  // get snippets with orgId
  const snippetAPIs = await fdrApplication.dao.snippetAPIs().loadSnippetAPIs({
    loadSnippetAPIsRequest: {
      orgIds: [FdrAPI.OrgId("example"), FdrAPI.OrgId("fern")],
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
  const sameSnippetAPIs = await fdrApplication.dao
    .snippetAPIs()
    .loadSnippetAPIs({
      loadSnippetAPIsRequest: {
        orgIds: [FdrAPI.OrgId("example"), FdrAPI.OrgId("fern")],
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
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      sdk: {
        type: "python",
        sdk: {
          package: "acme",
          version: "0.0.1",
        },
        snippets: [
          {
            endpoint: {
              path: FdrAPI.EndpointPathLiteral("/users/v1"),
              method: FdrAPI.HttpMethod.Get,
              identifierOverride: undefined,
            },
            snippet: {
              async_client: "invalid",
              sync_client: "invalid",
            },
            exampleIdentifier: undefined,
          },
        ],
      },
    },
  });
  // overwrite snippets for the same SDK
  await fdrApplication.dao.snippets().storeSnippets({
    storeSnippetsInfo: {
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      sdk: {
        type: "python",
        sdk: {
          package: "acme",
          version: "0.0.1",
        },
        snippets: [
          {
            endpoint: {
              path: FdrAPI.EndpointPathLiteral("/users/v1"),
              method: FdrAPI.HttpMethod.Get,
              identifierOverride: undefined,
            },
            snippet: {
              async_client: "client = AsyncAcme(api_key='YOUR_API_KEY')",
              sync_client: "client = Acme(api_key='YOUR_API_KEY')",
            },
            exampleIdentifier: undefined,
          },
        ],
      },
    },
  });
  await fdrApplication.dao.snippets().storeSnippets({
    storeSnippetsInfo: {
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      sdk: {
        type: "python",
        sdk: {
          package: "acme",
          version: "0.0.2",
        },
        snippets: [
          {
            endpoint: {
              path: FdrAPI.EndpointPathLiteral("/users/v1"),
              method: FdrAPI.HttpMethod.Get,
              identifierOverride: undefined,
            },
            snippet: {
              async_client: "client = AsyncAcme(api_key='YOUR_API_KEY')",
              sync_client: "client = Acme(api_key='YOUR_API_KEY')",
            },
            exampleIdentifier: undefined,
          },
        ],
      },
    },
  });
  // get snippets
  const response = await fdrApplication.dao.snippets().loadSnippetsPage({
    loadSnippetsInfo: {
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      endpointIdentifier: {
        path: FdrAPI.EndpointPathLiteral("/users/v1"),
        method: FdrAPI.HttpMethod.Get,
        identifierOverride: undefined,
      },
      sdks: undefined,
      page: undefined,
      exampleIdentifier: undefined,
    },
  });
  expect(response).not.toEqual(undefined);
  console.log("broo", JSON.stringify(response, null, 2));
  expect(Object.keys(response?.snippets ?? {}).length).toEqual(1);

  const snippets =
    response?.snippets[FdrAPI.EndpointPathLiteral("/users/v1")]?.GET;
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
  expect(snippet.async_client).toEqual(
    "client = AsyncAcme(api_key='YOUR_API_KEY')"
  );
  expect(snippet.sync_client).toEqual("client = Acme(api_key='YOUR_API_KEY')");

  const sdkId = await fdrApplication.dao
    .sdks()
    .getSdkIdForPackage({ sdkPackage: "acme", language: "PYTHON" });
  expect(sdkId).toEqual("python|acme|0.0.2");

  const sdkIdPrevious = await fdrApplication.dao.sdks().getSdkIdForPackage({
    sdkPackage: "acme",
    language: "PYTHON",
    version: "0.0.1",
  });
  expect(sdkIdPrevious).toEqual("python|acme|0.0.1");

  const snippetsForSdkId = await fdrApplication.dao
    .snippets()
    .loadAllSnippetsForSdkIds(sdkId != null ? [sdkId] : []);
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
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("apiId"),
      sdk: {
        type: "python",
        sdk: {
          package: "acme",
          version: "0.0.1",
        },
        snippets: [
          {
            endpoint: {
              path: FdrAPI.EndpointPathLiteral("/users/v1"),
              method: FdrAPI.HttpMethod.Get,
              identifierOverride: undefined,
            },
            snippet: {
              async_client: "invalid",
              sync_client: "invalid",
            },
            exampleIdentifier: "example1",
          },
          {
            endpoint: {
              path: FdrAPI.EndpointPathLiteral("/users/v1"),
              method: FdrAPI.HttpMethod.Get,
              identifierOverride: undefined,
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
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("apiId"),
      endpointIdentifier: {
        path: FdrAPI.EndpointPathLiteral("/users/v1"),
        method: FdrAPI.HttpMethod.Get,
        identifierOverride: undefined,
      },
      sdks: undefined,
      page: undefined,
      exampleIdentifier: "example1",
    },
  });
  expect(response).not.toEqual(undefined);
  expect(Object.keys(response?.snippets ?? {}).length).toEqual(1);

  const snippets =
    response?.snippets[FdrAPI.EndpointPathLiteral("/users/v1")]?.GET;
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
  expect(snippet.exampleIdentifier).toEqual("example1");
  expect(snippet.async_client).toEqual("invalid");
  expect(snippet.sync_client).toEqual("invalid");

  const response2 = await fdrApplication.dao.snippets().loadSnippetsPage({
    loadSnippetsInfo: {
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("apiId"),
      endpointIdentifier: {
        path: FdrAPI.EndpointPathLiteral("/users/v1"),
        method: FdrAPI.HttpMethod.Get,
        identifierOverride: undefined,
      },
      sdks: undefined,
      page: undefined,
      exampleIdentifier: "example2",
    },
  });
  expect(response2).not.toEqual(undefined);
  expect(Object.keys(response2?.snippets ?? {}).length).toEqual(1);

  const snippets2 =
    response2?.snippets[FdrAPI.EndpointPathLiteral("/users/v1")]?.GET;
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
  expect(snippet2.exampleIdentifier).toEqual("example2");
  expect(snippet2.async_client).toEqual(
    "client = AsyncAcme(api_key='YOUR_API_KEY')"
  );
  expect(snippet2.sync_client).toEqual("client = Acme(api_key='YOUR_API_KEY')");

  const response3 = await fdrApplication.dao.snippets().loadSnippetsPage({
    loadSnippetsInfo: {
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("apiId"),
      endpointIdentifier: {
        path: FdrAPI.EndpointPathLiteral("/users/v1"),
        method: FdrAPI.HttpMethod.Get,
        identifierOverride: undefined,
      },
      sdks: undefined,
      page: undefined,
      exampleIdentifier: undefined,
    },
  });
  const snippets3 =
    response3?.snippets[FdrAPI.EndpointPathLiteral("/users/v1")]?.GET;
  if (snippets3 === undefined) {
    throw new Error("snippets3 were undefined");
  }
  expect(snippets3).not.toEqual(undefined);
  expect(snippets3.length).toEqual(2);
});

it("snippets template", async () => {
  await fdrApplication.dao.snippetTemplates().storeSnippetTemplate({
    storeSnippetsInfo: {
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      apiDefinitionId: FdrAPI.ApiDefinitionId("...."),
      snippets: [
        {
          sdk: {
            type: "python",
            package: "acme",
            version: "0.0.1",
          },
          endpointId: {
            path: FdrAPI.EndpointPathLiteral("/users/v1"),
            method: FdrAPI.HttpMethod.Get,
            identifierOverride: undefined,
          },
          snippetTemplate: {
            type: "v1",
            clientInstantiation: "",
            functionInvocation: {
              type: "generic",
              isOptional: false,
              templateString: "",
              imports: undefined,
              templateInputs: undefined,
              inputDelimiter: undefined,
            },
          },
          additionalTemplates: undefined,
        },
        {
          sdk: {
            type: "typescript",
            package: "acme",
            version: "0.0.1",
          },
          endpointId: {
            path: FdrAPI.EndpointPathLiteral("/users/v1"),
            method: FdrAPI.HttpMethod.Get,
            identifierOverride: undefined,
          },
          snippetTemplate: {
            type: "v1",
            clientInstantiation: "",
            functionInvocation: {
              type: "generic",
              isOptional: false,
              templateString: "",
              imports: undefined,
              templateInputs: undefined,
              inputDelimiter: undefined,
            },
          },
          additionalTemplates: undefined,
        },
      ],
    },
  });

  const response = await fdrApplication.dao
    .snippetTemplates()
    .loadSnippetTemplate({
      loadSnippetTemplateRequest: {
        orgId: FdrAPI.OrgId("acme"),
        apiId: FdrAPI.ApiId("api"),
        endpointId: {
          path: FdrAPI.EndpointPathLiteral("/users/v1"),
          method: FdrAPI.HttpMethod.Get,
          identifierOverride: undefined,
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
    additionalTemplates: undefined,
    apiDefinitionId: FdrAPI.ApiDefinitionId("...."),
    endpointId: {
      identifierOverride: undefined,
      path: FdrAPI.EndpointPathLiteral("/users/v1"),
      method: "GET",
    },
    sdk: { type: "python", package: "acme", version: "0.0.1" },
    snippetTemplate: {
      type: "v1",
      functionInvocation: {
        type: "generic",
        isOptional: false,
        templateString: "",
      },
      clientInstantiation: "",
    },
  });

  const response2 = await fdrApplication.dao
    .snippetTemplates()
    .loadSnippetTemplatesByEndpoint({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      sdkRequests: [
        {
          type: "python",
          package: "acme",
          version: undefined,
        },
        {
          type: "typescript",
          package: "acme",
          version: undefined,
        },
      ],
      definition: {
        rootPackage: {
          endpoints: [
            {
              id: FdrAPI.EndpointId("getUsers"),
              path: {
                parts: [{ type: "literal", value: "/users/v1" }],
                pathParameters: [],
              },
              method: "GET",
              queryParameters: [],
              headers: [],
              examples: [],
              auth: undefined,
              defaultEnvironment: undefined,
              environments: undefined,
              originalEndpointId: undefined,
              name: undefined,
              request: undefined,
              response: undefined,
              errors: undefined,
              errorsV2: undefined,
              description: undefined,
              availability: undefined,
            },
          ],
          types: [],
          subpackages: [],
          websockets: undefined,
          webhooks: undefined,
          pointsTo: undefined,
        },
        types: {},
        subpackages: {},
        auth: undefined,
        globalHeaders: undefined,
        snippetsConfiguration: undefined,
        navigation: undefined,
      },
    });

  expect(response2).toEqual({
    "/users/v1": {
      PATCH: {},
      POST: {},
      PUT: {},
      GET: {
        python: {
          type: "v1",
          functionInvocation: {
            type: "generic",
            isOptional: false,
            templateString: "",
          },
          clientInstantiation: "",
        },
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

  const response3 = await fdrApplication.dao
    .snippetTemplates()
    .loadSnippetTemplatesByEndpoint({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("api"),
      sdkRequests: [
        {
          type: "go",
          githubRepo: "",
          version: undefined,
        },
      ],
      definition: {
        rootPackage: {
          endpoints: [
            {
              id: FdrAPI.EndpointId("getUsers"),
              path: {
                parts: [{ type: "literal", value: "/users/v1" }],
                pathParameters: [],
              },
              method: "GET",
              queryParameters: [],
              headers: [],
              examples: [],
              auth: undefined,
              defaultEnvironment: undefined,
              environments: undefined,
              originalEndpointId: undefined,
              name: undefined,
              request: undefined,
              response: undefined,
              errors: undefined,
              errorsV2: undefined,
              description: undefined,
              availability: undefined,
            },
          ],
          types: [],
          subpackages: [],
          websockets: undefined,
          webhooks: undefined,
          pointsTo: undefined,
        },
        types: {},
        subpackages: {},
        auth: undefined,
        globalHeaders: undefined,
        snippetsConfiguration: undefined,
        navigation: undefined,
      },
    });

  expect(response3).toEqual({});
});
