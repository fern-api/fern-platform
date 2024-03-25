import { APIV1Write, DocsV1Write, FdrAPI, FdrClient } from "@fern-api/fdr-sdk";
import { PrismaClient } from "@prisma/client";
import { addHours, subHours } from "date-fns";
import express from "express";
import http from "http";
import lodash from "lodash";
// eslint-disable-next-line jest/unbound-method
const { uniqueId } = lodash;
import { register } from "../../api";
import { FdrApplication } from "../../app";
import { getReadApiService } from "../../controllers/api/getApiReadService";
import { getRegisterApiService } from "../../controllers/api/getRegisterApiService";
import { getDocsReadService } from "../../controllers/docs/v1/getDocsReadService";
import { getDocsWriteService } from "../../controllers/docs/v1/getDocsWriteService";
import { getDocsReadV2Service } from "../../controllers/docs/v2/getDocsReadV2Service";
import { getDocsWriteV2Service } from "../../controllers/docs/v2/getDocsWriteV2Service";
import { getSnippetsFactoryService } from "../../controllers/snippets/getSnippetsFactoryService";
import { getSnippetsService } from "../../controllers/snippets/getSnippetsService";
import { DEFAULT_SNIPPETS_PAGE_SIZE } from "../../db/snippets/SnippetsDao";
import { createMockFdrApplication } from "../mock";
import { createApiDefinition, createMockDocs, createMockIndexSegment } from "./util";

type APIResponse<Success, Failure> = SuccessfulResponse<Success> | FailedResponse<Failure>;
interface SuccessfulResponse<T> {
    ok: true;
    body: T;
}
interface FailedResponse<T> {
    ok: false;
    error: T;
}

const PORT = 9999;

const UNAUTHENTICATED_CLIENT = new FdrClient({
    environment: `http://localhost:${PORT}/`,
});

const CLIENT = new FdrClient({
    environment: `http://localhost:${PORT}/`,
    token: "dummy",
});

const app = express();
const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
});
let serverApp: FdrApplication | undefined;
let server: http.Server | undefined;

beforeAll(async () => {
    serverApp = createMockFdrApplication({
        orgIds: ["acme"],
    });
    register(app, {
        docs: {
            v1: {
                read: { _root: getDocsReadService(serverApp) },
                write: { _root: getDocsWriteService(serverApp) },
            },
            v2: {
                read: { _root: getDocsReadV2Service(serverApp) },
                write: { _root: getDocsWriteV2Service(serverApp) },
            },
        },
        api: {
            v1: {
                read: { _root: getReadApiService(serverApp) },
                register: { _root: getRegisterApiService(serverApp) },
            },
        },
        _root: getSnippetsService(serverApp),
        snippetsFactory: getSnippetsFactoryService(serverApp),
    });
    console.log(`Listening for requests on port ${PORT}`);
    server = app.listen(PORT);
});

afterAll(async () => {
    await prisma.$disconnect();
    if (server != null) {
        server.close();
    }
});

const EMPTY_REGISTER_API_DEFINITION: APIV1Write.ApiDefinition = {
    rootPackage: {
        endpoints: [],
        webhooks: [],
        websockets: [],
        types: [],
        subpackages: [],
    },
    subpackages: {},
    types: {},
};

const MOCK_REGISTER_API_DEFINITION: APIV1Write.ApiDefinition = createApiDefinition({
    endpointId: "dummy",
    endpointMethod: "POST",
    endpointPath: {
        parts: [{ type: "literal", value: "dummy" }],
        pathParameters: [],
    },
});

function getAPIResponse<Success, Failure>(response: APIResponse<Success, Failure>): Success {
    if (response.ok) {
        return response.body;
    }
    throw new Error(`Received error from response: ${JSON.stringify(response.error)}`);
}

it("definition register", async () => {
    // register empty definition
    const emptyDefinitionRegisterResponse = getAPIResponse(
        await CLIENT.api.v1.register.registerApiDefinition({
            orgId: "fern",
            apiId: "api",
            definition: EMPTY_REGISTER_API_DEFINITION,
        }),
    );

    console.log(`Registered empty definition. Received ${emptyDefinitionRegisterResponse.apiDefinitionId}`);
    // load empty definition
    const registeredEmptyDefinition = getAPIResponse(
        await CLIENT.api.v1.read.getApi(emptyDefinitionRegisterResponse.apiDefinitionId),
    );

    // assert definitions are equal
    expect(JSON.stringify(registeredEmptyDefinition.types)).toEqual(
        JSON.stringify(EMPTY_REGISTER_API_DEFINITION.types),
    );
    expect(JSON.stringify(registeredEmptyDefinition.subpackages)).toEqual(
        JSON.stringify(EMPTY_REGISTER_API_DEFINITION.subpackages),
    );
    expect(registeredEmptyDefinition.rootPackage).toEqual(EMPTY_REGISTER_API_DEFINITION.rootPackage);

    // register updated definition
    const updatedDefinitionRegisterResponse = getAPIResponse(
        await CLIENT.api.v1.register.registerApiDefinition({
            orgId: "fern",
            apiId: "api",
            definition: MOCK_REGISTER_API_DEFINITION,
        }),
    );
    // load updated definition
    const updatedDefinition = getAPIResponse(
        await CLIENT.api.v1.read.getApi(updatedDefinitionRegisterResponse.apiDefinitionId),
    );
    // assert definitions equal
    expect(JSON.stringify(updatedDefinition.types)).toEqual(JSON.stringify(MOCK_REGISTER_API_DEFINITION.types));
    expect(JSON.stringify(updatedDefinition.subpackages)).toEqual(
        JSON.stringify(MOCK_REGISTER_API_DEFINITION.subpackages),
    );
});

const fontFileId = uniqueId();
const WRITE_DOCS_REGISTER_DEFINITION: DocsV1Write.DocsDefinition = {
    pages: {},
    config: {
        navigation: {
            items: [],
        },
        typography: {
            headingsFont: {
                name: "Syne",
                fontFile: fontFileId,
            },
        },
    },
};

it("docs register", async () => {
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await CLIENT.docs.v1.write.startDocsRegister({
            orgId: "fern",
            domain: "docs.fern.com",
            filepaths: ["logo.png", "guides/guide.mdx"],
        }),
    );
    await CLIENT.docs.v1.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
    // load docs
    const docs = getAPIResponse(
        await CLIENT.docs.v1.read.getDocsForDomain({
            domain: "docs.fern.com",
        }),
    );
    // assert docs have 2 file urls
    expect(Object.entries(docs.files)).toHaveLength(2);

    // re-register docs
    const startDocsRegisterResponse2 = getAPIResponse(
        await CLIENT.docs.v1.write.startDocsRegister({
            orgId: "fern",
            domain: "docs.fern.com",
            filepaths: [],
        }),
    );
    await CLIENT.docs.v1.write.finishDocsRegister(startDocsRegisterResponse2.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
});

it("docs register V2", async () => {
    // register docs
    const startDocsRegisterResponse = getAPIResponse(
        await CLIENT.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "api",
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: ["https://docs.useacme.com/docs"],
            filepaths: ["logo.png", "guides/guide.mdx", "fonts/Syne.woff2"],
        }),
    );
    await CLIENT.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
    // load docs
    let docs = getAPIResponse(
        await CLIENT.docs.v2.read.getDocsForUrl({
            url: "https://acme.docs.buildwithfern.com/my/random/slug",
        }),
    );
    expect(docs.baseUrl.domain).toEqual("acme.docs.buildwithfern.com");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);
    expect(docs.definition.config.typography).toEqual({
        headingsFont: {
            name: "Syne",
            fontFile: fontFileId,
        },
    });
    // load docs again
    docs = getAPIResponse(
        await CLIENT.docs.v2.read.getDocsForUrl({
            url: "https://docs.useacme.com/docs/1/",
        }),
    );
    expect(docs.baseUrl.domain).toEqual("docs.useacme.com");
    expect(docs.baseUrl.basePath).toEqual("/docs");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);

    //re-register docs
    const startDocsRegisterResponse2 = getAPIResponse(
        await CLIENT.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "api",
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: ["https://docs.useacme.com"],
            filepaths: [],
        }),
    );
    await CLIENT.docs.v2.write.finishDocsRegister(startDocsRegisterResponse2.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
});

describe("algolia index segment deleter", () => {
    let serverApp: FdrApplication;

    beforeAll(() => {
        serverApp = createMockFdrApplication({});
    });

    it("correctly deletes old inactive index segments for unversioned docs", async () => {
        const domain = "docs.fern.com";
        const path = "abc";

        // Index segments that were deleted before this date are considered "dated" or "old"
        // Fern only deletes old segments that are not referenced by any docs
        const olderThanHours = 24;
        const oldSegmentCutoffDate = subHours(new Date(), olderThanHours);

        const inactiveOldIndexSegments = [
            createMockIndexSegment({ id: "seg_10", createdAt: subHours(oldSegmentCutoffDate, 4) }),
            createMockIndexSegment({ id: "seg_11", createdAt: subHours(oldSegmentCutoffDate, 3) }),
            createMockIndexSegment({ id: "seg_12", createdAt: subHours(oldSegmentCutoffDate, 2) }),
            createMockIndexSegment({ id: "seg_13", createdAt: subHours(oldSegmentCutoffDate, 1) }),
        ];
        const activeIndexSegments = [
            createMockIndexSegment({ id: "seg_14", createdAt: addHours(oldSegmentCutoffDate, 1) }),
        ];
        const docsV2 = createMockDocs({ domain, path, indexSegmentIds: activeIndexSegments.map((s) => s.id) });

        await serverApp.services.db.prisma.$transaction(async (tx) => {
            await tx.docsV2.create({ data: { ...docsV2, indexSegmentIds: docsV2.indexSegmentIds as string[] } });
            const allIndexSegments = [...inactiveOldIndexSegments, ...activeIndexSegments];
            await Promise.all(allIndexSegments.map((seg) => tx.indexSegment.create({ data: seg })));
        });

        await serverApp.services.algoliaIndexSegmentDeleter.deleteOldInactiveIndexSegments({
            olderThanHours,
        });

        const newIndexSegmentRecords = await serverApp.services.db.prisma.indexSegment.findMany({
            select: { id: true },
        });
        const newIndexSegmentRecordIds = new Set(newIndexSegmentRecords.map((r) => r.id));

        // Expect inactive old segments to be deleted
        inactiveOldIndexSegments.forEach((s) => {
            expect(newIndexSegmentRecordIds.has(s.id)).toBe(false);
        });

        // Expect active segments to remain
        activeIndexSegments.forEach((s) => {
            expect(newIndexSegmentRecordIds.has(s.id)).toBe(true);
        });
    });
});

it("snippet api dao", async () => {
    // create snippets
    await serverApp?.dao.snippets().storeSnippets({
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
    const snippetAPIs = await serverApp?.dao.snippetAPIs().loadSnippetAPIs({
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
    const sameSnippetAPIs = await serverApp?.dao.snippetAPIs().loadSnippetAPIs({
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
    await serverApp?.dao.snippets().storeSnippets({
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
    await serverApp?.dao.snippets().storeSnippets({
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
    // get snippets
    const response = await serverApp?.dao.snippets().loadSnippetsPage({
        loadSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            endpointIdentifier: {
                path: "/users/v1",
                method: FdrAPI.EndpointMethod.Get,
            },
            sdks: undefined,
            page: undefined,
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
    expect(snippet.async_client).toEqual("client = AsyncAcme(api_key='YOUR_API_KEY')");
    expect(snippet.sync_client).toEqual("client = Acme(api_key='YOUR_API_KEY')");

    const sdkId = await serverApp?.dao.sdks().getLatestSdkIdForPackage({ sdkPackage: "acme", language: "PYTHON" });
    expect(sdkId).toEqual("python|acme|0.0.1");

    const snippetsForSdkId = await serverApp?.dao.snippets().loadAllSnippetsForSdkIds(sdkId != null ? [sdkId] : []);
    expect(snippetsForSdkId).toEqual({
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
    });
});

it("get snippets", async () => {
    // create snippets
    await CLIENT.snippetsFactory.createSnippetsForSdk({
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
        await CLIENT.get({
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
        await CLIENT.api.v1.register.registerApiDefinition({
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
        await CLIENT.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "foo",
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: [],
            filepaths: ["logo.png", "guides/guide.mdx"],
            images: [],
        }),
    );
    await CLIENT.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
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
                        fontFile: fontFileId,
                    },
                },
            },
        },
    });
    // get docs for url
    const docs = getAPIResponse(
        await CLIENT.docs.v2.read.getDocsForUrl({
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
    // create snippets
    await CLIENT.snippetsFactory.createSnippetsForSdk({
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
        await CLIENT.get({
            apiId: "echo",
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
        await CLIENT.api.v1.register.registerApiDefinition({
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
        await CLIENT.docs.v2.write.startDocsRegister({
            orgId: "acme",
            apiId: "echo",
            domain: "https://acme.docs.buildwithfern.com",
            customDomains: [],
            filepaths: ["logo.png", "guides/guide.mdx"],
            images: [],
        }),
    );
    await CLIENT.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
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
                        fontFile: fontFileId,
                    },
                },
            },
        },
    });
    // get docs for url
    const docs = getAPIResponse(
        await CLIENT.docs.v2.read.getDocsForUrl({
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
    // create snippets
    await CLIENT.snippetsFactory.createSnippetsForSdk({
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
        await CLIENT.get({
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
    // register API definition for acme org
    await CLIENT.api.v1.register.registerApiDefinition({
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
    await CLIENT.snippetsFactory.createSnippetsForSdk({
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
        await CLIENT.load({
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
        await CLIENT.load({
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
    // create snippets
    await CLIENT.snippetsFactory.createSnippetsForSdk({
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
    const response = await CLIENT.get({
        orgId: "private",
        endpoint: {
            path: "/users/v1",
            method: FdrAPI.EndpointMethod.Get,
        },
    });
    expect(response.ok === false && response.error.error === "UnauthorizedError");
});

it("snippets apiId not found", async () => {
    // create snippets
    await CLIENT.snippetsFactory.createSnippetsForSdk({
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
    const response = await CLIENT.get({
        apiId: "dne",
        endpoint: {
            path: "/users/v1",
            method: FdrAPI.EndpointMethod.Get,
        },
    });
    expect(response.ok === false && response.error.error === "OrgIdAndApiIdNotFound");
});

it("get snippets (unauthenticated)", async () => {
    // register API definition for acme org
    await CLIENT.api.v1.register.registerApiDefinition({
        orgId: "acme",
        apiId: "user",
        definition: EMPTY_REGISTER_API_DEFINITION,
    });
    // create snippets
    await CLIENT.snippetsFactory.createSnippetsForSdk({
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
    const response = await UNAUTHENTICATED_CLIENT.get({
        apiId: "user",
        endpoint: {
            path: "/users/v1",
            method: FdrAPI.EndpointMethod.Get,
        },
    });
    expect(response.ok === false && response.error.error === "UnauthorizedError");
});
