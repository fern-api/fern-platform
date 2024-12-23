import { DocsV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { inject } from "vitest";
import { DEFAULT_SNIPPETS_PAGE_SIZE } from "../../../db/snippets/SnippetsDao";
import { createApiDefinition, getAPIResponse, getClient } from "../util";
import { EMPTY_REGISTER_API_DEFINITION } from "./api.test";
import { FONT_FILE_ID } from "./docs.test";

it("get snippets", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });
  // create snippets
  await fdr.snippetsFactory.createSnippetsForSdk({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("foo"),
    snippets: {
      type: "python",
      sdk: {
        package: "acme",
        version: "0.0.2",
      },
      snippets: [
        {
          endpoint: {
            path: FdrAPI.EndpointPathLiteral("/snippets/load"),
            method: FdrAPI.HttpMethod.Post,
            identifierOverride: undefined,
          },
          snippet: {
            async_client:
              "const petstore = new AsyncPetstoreClient(\napi_key='YOUR_API_KEY',\n)",
            sync_client:
              "const petstore = new PetstoreClient(\napi_key='YOUR_API_KEY',\n)",
          },
          exampleIdentifier: undefined,
        },
      ],
    },
  });
  // get snippets
  const snippets = getAPIResponse(
    await fdr.snippets.get({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("foo"),
      endpoint: {
        path: FdrAPI.EndpointPathLiteral("/snippets/load"),
        method: FdrAPI.HttpMethod.Post,
        identifierOverride: undefined,
      },
    })
  );
  expect(snippets.length).toEqual(1);

  const snippet = snippets[0] as FdrAPI.PythonSnippet;
  expect(snippet.sdk.package).toEqual("acme");
  expect(snippet.sdk.version).toEqual("0.0.2");
  expect(snippet.async_client).toEqual(
    "const petstore = new AsyncPetstoreClient(\napi_key='YOUR_API_KEY',\n)"
  );
  expect(snippet.sync_client).toEqual(
    "const petstore = new PetstoreClient(\napi_key='YOUR_API_KEY',\n)"
  );
  // register API definition for acme org
  const apiDefinitionResponse = getAPIResponse(
    await fdr.api.v1.register.registerApiDefinition({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("foo"),
      definition: createApiDefinition({
        endpointId: FdrAPI.EndpointId("/snippets/load"),
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
            version: undefined,
          },
          typescriptSdk: undefined,
          goSdk: undefined,
          rubySdk: undefined,
          javaSdk: undefined,
        },
      }),
    })
  );
  // register docs
  const startDocsRegisterResponse = getAPIResponse(
    await fdr.docs.v2.write.startDocsRegister({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("foo"),
      domain: "https://acme.docs.buildwithfern.com",
      customDomains: [],
      filepaths: [
        DocsV1Write.FilePath("logo.png"),
        DocsV1Write.FilePath("guides/guide.mdx"),
      ],
      images: [],
    })
  );
  await fdr.docs.v2.write.finishDocsRegister(
    startDocsRegisterResponse.docsRegistrationId,
    {
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
                showErrors: undefined,
                changelog: undefined,
                changelogV2: undefined,
                navigation: undefined,
                longScrolling: undefined,
                flattened: undefined,
                icon: undefined,
                hidden: undefined,
                urlSlugOverride: undefined,
                fullSlug: undefined,
              },
            ],
          },
          root: undefined,
          typography: {
            headingsFont: {
              name: "Syne",
              fontFile: FONT_FILE_ID,
            },
            bodyFont: undefined,
            codeFont: undefined,
          },
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
          backgroundImage: undefined,
          logoV2: undefined,
          logo: undefined,
          colors: undefined,
          colorsV2: undefined,
        },
        jsFiles: undefined,
      },
    }
  );
  // get docs for url
  const docs = getAPIResponse(
    await fdr.docs.v2.read.getDocsForUrl({
      url: FdrAPI.Url("https://acme.docs.buildwithfern.com"),
    })
  );
  const apiDefinition =
    docs.definition.apis[apiDefinitionResponse.apiDefinitionId];
  expect(apiDefinition).not.toEqual(undefined);
  expect(
    apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.pythonSdk
  ).not.toEqual(undefined);
  expect(
    apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.pythonSdk
      ?.async_client
  ).toEqual(
    "const petstore = new AsyncPetstoreClient(\napi_key='YOUR_API_KEY',\n)"
  );
  expect(
    apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.pythonSdk
      ?.sync_client
  ).toEqual("const petstore = new PetstoreClient(\napi_key='YOUR_API_KEY',\n)");
});

it("get Go snippets", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });
  // create snippets
  await fdr.snippetsFactory.createSnippetsForSdk({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("echo"),
    snippets: {
      type: "go",
      sdk: {
        githubRepo: "https://github.com/acme/acme-go",
        version: "0.0.10",
      },
      snippets: [
        {
          endpoint: {
            path: FdrAPI.EndpointPathLiteral("/snippets/load"),
            method: FdrAPI.HttpMethod.Post,
            identifierOverride: undefined,
          },
          snippet: {
            client: "client := acmeclient.NewClient()\n",
          },
          exampleIdentifier: undefined,
        },
      ],
    },
  });
  // get snippets
  const snippets = getAPIResponse(
    await fdr.snippets.get({
      apiId: FdrAPI.ApiId("echo"),
      orgId: FdrAPI.OrgId("acme"),
      endpoint: {
        path: FdrAPI.EndpointPathLiteral("/snippets/load"),
        method: FdrAPI.HttpMethod.Post,
        identifierOverride: undefined,
      },
    })
  );
  expect(snippets.length).toEqual(1);

  const snippet = snippets[0] as FdrAPI.GoSnippet;
  expect(snippet.sdk.githubRepo).toEqual("https://github.com/acme/acme-go");
  expect(snippet.sdk.version).toEqual("0.0.10");
  expect(snippet.client).toEqual("client := acmeclient.NewClient()\n");
  // register API definition for acme org
  const apiDefinitionResponse = getAPIResponse(
    await fdr.api.v1.register.registerApiDefinition({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("echo"),
      definition: createApiDefinition({
        endpointId: FdrAPI.EndpointId("/snippets/load"),
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
            version: undefined,
          },
          typescriptSdk: undefined,
          pythonSdk: undefined,
          javaSdk: undefined,
          rubySdk: undefined,
        },
      }),
    })
  );
  // register docs
  const startDocsRegisterResponse = getAPIResponse(
    await fdr.docs.v2.write.startDocsRegister({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("echo"),
      domain: "https://acme.docs.buildwithfern.com",
      customDomains: [],
      filepaths: [
        DocsV1Write.FilePath("logo.png"),
        DocsV1Write.FilePath("guides/guide.mdx"),
      ],
      images: [],
    })
  );
  await fdr.docs.v2.write.finishDocsRegister(
    startDocsRegisterResponse.docsRegistrationId,
    {
      docsDefinition: {
        pages: {},
        config: {
          navigation: {
            items: [
              {
                type: "api",
                title: "Acme API",
                api: apiDefinitionResponse.apiDefinitionId,
                artifacts: undefined,
                skipUrlSlug: undefined,
                showErrors: undefined,
                changelog: undefined,
                changelogV2: undefined,
                navigation: undefined,
                longScrolling: undefined,
                flattened: undefined,
                icon: undefined,
                hidden: undefined,
                urlSlugOverride: undefined,
                fullSlug: undefined,
              },
            ],
            landingPage: undefined,
          },
          root: undefined,
          typography: {
            headingsFont: {
              name: "Syne",
              fontFile: FONT_FILE_ID,
            },
            bodyFont: undefined,
            codeFont: undefined,
          },
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
          backgroundImage: undefined,
          logoV2: undefined,
          logo: undefined,
          colors: undefined,
          colorsV2: undefined,
        },
        jsFiles: undefined,
      },
    }
  );
  // get docs for url
  const docs = getAPIResponse(
    await fdr.docs.v2.read.getDocsForUrl({
      url: FdrAPI.Url("https://acme.docs.buildwithfern.com"),
    })
  );
  const apiDefinition =
    docs.definition.apis[apiDefinitionResponse.apiDefinitionId];
  expect(apiDefinition).not.toEqual(undefined);
  expect(
    apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.goSdk
  ).not.toEqual(undefined);
  expect(
    apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.goSdk
      ?.client
  ).toEqual("client := acmeclient.NewClient()\n");
});

it("get Ruby snippets", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });
  // create snippets
  await fdr.snippetsFactory.createSnippetsForSdk({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("bar"),
    snippets: {
      type: "ruby",
      sdk: {
        gem: "acme_ruby",
        version: "0.0.10",
      },
      snippets: [
        {
          endpoint: {
            path: FdrAPI.EndpointPathLiteral("/snippets/load"),
            method: FdrAPI.HttpMethod.Post,
            identifierOverride: undefined,
          },
          snippet: {
            client: "client = Acme::Client()\n",
          },
          exampleIdentifier: undefined,
        },
      ],
    },
  });
  // get snippets
  const snippets = getAPIResponse(
    await fdr.snippets.get({
      apiId: FdrAPI.ApiId("bar"),
      orgId: FdrAPI.OrgId("acme"),
      endpoint: {
        path: FdrAPI.EndpointPathLiteral("/snippets/load"),
        method: FdrAPI.HttpMethod.Post,
        identifierOverride: undefined,
      },
    })
  );
  expect(snippets.length).toEqual(1);

  const snippet = snippets[0] as FdrAPI.RubySnippet;
  expect(snippet.sdk.gem).toEqual("acme_ruby");
  expect(snippet.sdk.version).toEqual("0.0.10");
  expect(snippet.client).toEqual("client = Acme::Client()\n");
  // register API definition for acme org
  const apiDefinitionResponse = getAPIResponse(
    await fdr.api.v1.register.registerApiDefinition({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("bar"),
      definition: createApiDefinition({
        endpointId: FdrAPI.EndpointId("/snippets/load"),
        endpointMethod: "POST",
        endpointPath: {
          parts: [
            { type: "literal", value: "/snippets" },
            { type: "literal", value: "/load" },
          ],
          pathParameters: [],
        },
        snippetsConfig: {
          rubySdk: {
            gem: "acme_ruby",
            version: undefined,
          },
          typescriptSdk: undefined,
          pythonSdk: undefined,
          javaSdk: undefined,
          goSdk: undefined,
        },
      }),
    })
  );
  // register docs
  const startDocsRegisterResponse = getAPIResponse(
    await fdr.docs.v2.write.startDocsRegister({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("bar"),
      domain: "https://acme.docs.buildwithfern.com",
      customDomains: [],
      filepaths: [
        DocsV1Write.FilePath("logo.png"),
        DocsV1Write.FilePath("guides/guide.mdx"),
      ],
      images: [],
    })
  );
  await fdr.docs.v2.write.finishDocsRegister(
    startDocsRegisterResponse.docsRegistrationId,
    {
      docsDefinition: {
        pages: {},
        config: {
          navigation: {
            items: [
              {
                type: "api",
                title: "Acme API",
                api: apiDefinitionResponse.apiDefinitionId,
                artifacts: undefined,
                skipUrlSlug: undefined,
                showErrors: undefined,
                changelog: undefined,
                changelogV2: undefined,
                navigation: undefined,
                longScrolling: undefined,
                flattened: undefined,
                icon: undefined,
                hidden: undefined,
                urlSlugOverride: undefined,
                fullSlug: undefined,
              },
            ],
            landingPage: undefined,
          },
          root: undefined,
          typography: {
            headingsFont: {
              name: "Syne",
              fontFile: FONT_FILE_ID,
            },
            bodyFont: undefined,
            codeFont: undefined,
          },
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
          backgroundImage: undefined,
          logoV2: undefined,
          logo: undefined,
          colors: undefined,
          colorsV2: undefined,
        },
        jsFiles: undefined,
      },
    }
  );
  // get docs for url
  const docs = getAPIResponse(
    await fdr.docs.v2.read.getDocsForUrl({
      url: FdrAPI.Url("https://acme.docs.buildwithfern.com"),
    })
  );
  const apiDefinition =
    docs.definition.apis[apiDefinitionResponse.apiDefinitionId];
  expect(apiDefinition).not.toEqual(undefined);
  expect(
    apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.rubySdk
  ).not.toEqual(undefined);
  expect(
    apiDefinition?.rootPackage.endpoints[0]?.examples[0]?.codeExamples.rubySdk
      ?.client
  ).toEqual("client = Acme::Client()\n");
});

it("get snippets with unregistered API", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });
  // create snippets
  await fdr.snippetsFactory.createSnippetsForSdk({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("fresh"),
    snippets: {
      type: "typescript",
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
            client:
              "const petstore = new PetstoreClient({\napiKey: 'YOUR_API_KEY',\n});",
          },
          exampleIdentifier: undefined,
        },
      ],
    },
  });
  // get snippets
  const snippets = getAPIResponse(
    await fdr.snippets.get({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("fresh"),
      endpoint: {
        path: FdrAPI.EndpointPathLiteral("/users/v1"),
        method: FdrAPI.HttpMethod.Get,
        identifierOverride: undefined,
      },
    })
  );
  expect(snippets.length).toEqual(1);

  const snippet = snippets[0] as FdrAPI.TypeScriptSnippet;
  expect(snippet.sdk.package).toEqual("acme");
  expect(snippet.sdk.version).toEqual("0.0.1");
  expect(snippet.client).toEqual(
    "const petstore = new PetstoreClient({\napiKey: 'YOUR_API_KEY',\n});"
  );
});

it("load snippets", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });
  // register API definition for acme org
  await fdr.api.v1.register.registerApiDefinition({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("user"),
    definition: EMPTY_REGISTER_API_DEFINITION,
  });
  // initialize enough snippets to occupy two pages
  const snippets: FdrAPI.SingleTypescriptSnippetCreate[] = [];
  for (let i = 0; i < DEFAULT_SNIPPETS_PAGE_SIZE * 2; i++) {
    snippets.push({
      endpoint: {
        path: FdrAPI.EndpointPathLiteral(`/users/v${i}`),
        method: FdrAPI.HttpMethod.Get,
        identifierOverride: undefined,
      },
      snippet: {
        client: `const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`,
      },
      exampleIdentifier: undefined,
    });
  }
  // create snippets
  await fdr.snippetsFactory.createSnippetsForSdk({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("petstore"),
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
    await fdr.snippets.load({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("petstore"),
    })
  );
  expect(firstResponse.next).toEqual(2);
  expect(Object.keys(firstResponse.snippets).length).toEqual(
    DEFAULT_SNIPPETS_PAGE_SIZE
  );

  for (let i = 0; i < DEFAULT_SNIPPETS_PAGE_SIZE; i++) {
    const snippetsForEndpointMethod =
      firstResponse.snippets[FdrAPI.EndpointPathLiteral(`/users/v${i}`)];
    const responseSnippets = snippetsForEndpointMethod?.GET;
    expect(responseSnippets?.length).toEqual(1);
    if (responseSnippets === undefined) {
      throw new Error("response snippets must not be undefined");
    }
    const snippet = responseSnippets[0] as FdrAPI.TypeScriptSnippet;
    expect(snippet.sdk.package).toEqual("acme");
    expect(snippet.sdk.version).toEqual("0.0.1");
    expect(snippet.client).toEqual(
      `const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`
    );
  }

  // load snippets (second page)
  const secondResponse = getAPIResponse(
    await fdr.snippets.load({
      orgId: FdrAPI.OrgId("acme"),
      apiId: FdrAPI.ApiId("petstore"),
      sdks: [
        {
          type: "typescript",
          package: "acme",
          version: "0.0.1",
        },
      ],
      page: firstResponse.next,
    })
  );
  expect(Object.keys(secondResponse.snippets).length).toEqual(
    DEFAULT_SNIPPETS_PAGE_SIZE
  );

  for (
    let i = DEFAULT_SNIPPETS_PAGE_SIZE;
    i < DEFAULT_SNIPPETS_PAGE_SIZE * 2;
    i++
  ) {
    const snippetsForEndpointMethod =
      secondResponse.snippets[FdrAPI.EndpointPathLiteral(`/users/v${i}`)];
    const responseSnippets = snippetsForEndpointMethod?.GET;
    expect(responseSnippets?.length).toEqual(1);
    if (responseSnippets === undefined) {
      throw new Error("response snippets must not be undefined");
    }
    const snippet = responseSnippets[0] as FdrAPI.TypeScriptSnippet;
    expect(snippet.sdk.package).toEqual("acme");
    expect(snippet.sdk.version).toEqual("0.0.1");
    expect(snippet.client).toEqual(
      `const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`
    );
  }
  expect(secondResponse.next).toEqual(3);
});

it("user not part of org", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });
  // create snippets
  await fdr.snippetsFactory.createSnippetsForSdk({
    orgId: FdrAPI.OrgId("private"),
    apiId: FdrAPI.ApiId("baz"),
    snippets: {
      type: "go",
      sdk: {
        githubRepo: "fern-api/user-go",
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
            client:
              "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
          },
          exampleIdentifier: undefined,
        },
      ],
    },
  });
  // get snippets
  const response = await fdr.snippets.get({
    orgId: FdrAPI.OrgId("private"),
    endpoint: {
      path: FdrAPI.EndpointPathLiteral("/users/v1"),
      method: FdrAPI.HttpMethod.Get,
      identifierOverride: undefined,
    },
  });
  console.log("bruh", JSON.stringify(response));

  expect(!response.ok).toBe(true);
});

it("snippets apiId not found", async () => {
  const fdr = getClient({ authed: true, url: inject("url") });
  // create snippets
  await fdr.snippetsFactory.createSnippetsForSdk({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("petstore"),
    snippets: {
      type: "typescript",
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
            client:
              "const acme = new AcmeClient({\napiKey: 'YOUR_API_KEY',\n});",
          },
          exampleIdentifier: undefined,
        },
      ],
    },
  });

  // get not found apiId
  const response = await fdr.snippets.get({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("dne"),
    endpoint: {
      path: FdrAPI.EndpointPathLiteral("/users/v1"),
      method: FdrAPI.HttpMethod.Get,
      identifierOverride: undefined,
    },
  });
  expect(!response.ok).toBe(true);
});

it("get snippets (unauthenticated)", async () => {
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
            path: FdrAPI.EndpointPathLiteral("/users/v1"),
            method: FdrAPI.HttpMethod.Get,
            identifierOverride: undefined,
          },
          snippet: {
            client:
              "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
          },
          exampleIdentifier: undefined,
        },
      ],
    },
  });
  // get snippets
  const unauthedFdr = getClient({ authed: false, url: inject("url") });
  const response = await unauthedFdr.snippets.get({
    orgId: FdrAPI.OrgId("acme"),
    apiId: FdrAPI.ApiId("user"),
    endpoint: {
      path: FdrAPI.EndpointPathLiteral("/users/v1"),
      method: FdrAPI.HttpMethod.Get,
      identifierOverride: undefined,
    },
  });
  expect(response.ok).toBe(false);
});
