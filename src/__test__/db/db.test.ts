import { PrismaClient } from "@prisma/client";
import { addHours, subHours } from "date-fns";
import express from "express";
import http from "http";
import { uniqueId } from "lodash";
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
import { DEFAULT_SNIPPETS_PAGE_SIZE } from "../../db/SnippetsDao";
import { FernRegistry, FernRegistryClient, FernRegistryError } from "../generated";
import { createMockFdrApplication } from "../mock";
import { createMockDocs, createMockIndexSegment } from "./util";

const PORT = 9999;

const UNAUTHENTICATED_CLIENT = new FernRegistryClient({
    environment: `http://localhost:${PORT}/`,
});

const CLIENT = new FernRegistryClient({
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

const EMPTY_REGISTER_API_DEFINITION: FernRegistry.api.v1.register.ApiDefinition = {
    rootPackage: {
        endpoints: [],
        webhooks: [],
        types: [],
        subpackages: [],
    },
    subpackages: {},
    types: {},
};

const MOCK_REGISTER_API_DEFINITION: FernRegistry.api.v1.register.ApiDefinition = {
    rootPackage: {
        endpoints: [
            {
                id: "dummy",
                method: "POST",
                path: {
                    parts: [{ type: "literal", value: "dummy" }],
                    pathParameters: [],
                },
                headers: [],
                queryParameters: [],
                examples: [],
            },
        ],
        types: [],
        subpackages: [],
    },
    subpackages: {},
    types: {},
};

it("definition register", async () => {
    // register empty definition
    const emptyDefinitionRegisterResponse = await CLIENT.api.v1.register.registerApiDefinition({
        orgId: "fern",
        apiId: "api",
        definition: EMPTY_REGISTER_API_DEFINITION,
    });
    console.log(`Registered empty definition. Received ${emptyDefinitionRegisterResponse.apiDefinitionId}`);
    // load empty definition
    const registeredEmptyDefinition = await CLIENT.api.v1.read.getApi(emptyDefinitionRegisterResponse.apiDefinitionId);
    // assert definitions are equal
    expect(JSON.stringify(registeredEmptyDefinition.types)).toEqual(
        JSON.stringify(EMPTY_REGISTER_API_DEFINITION.types)
    );
    expect(JSON.stringify(registeredEmptyDefinition.subpackages)).toEqual(
        JSON.stringify(EMPTY_REGISTER_API_DEFINITION.subpackages)
    );
    expect(registeredEmptyDefinition.rootPackage).toEqual(EMPTY_REGISTER_API_DEFINITION.rootPackage);

    // register updated definition
    const updatedDefinitionRegisterResponse = await CLIENT.api.v1.register.registerApiDefinition({
        orgId: "fern",
        apiId: "api",
        definition: MOCK_REGISTER_API_DEFINITION,
    });
    // load updated definition
    const updatedDefinition = await CLIENT.api.v1.read.getApi(updatedDefinitionRegisterResponse.apiDefinitionId);
    // assert definitions equal
    expect(JSON.stringify(updatedDefinition.types)).toEqual(JSON.stringify(MOCK_REGISTER_API_DEFINITION.types));
    expect(JSON.stringify(updatedDefinition.subpackages)).toEqual(
        JSON.stringify(MOCK_REGISTER_API_DEFINITION.subpackages)
    );
});

const fontFileId = uniqueId();
const WRITE_DOCS_REGISTER_DEFINITION: FernRegistry.docs.v1.write.DocsDefinition = {
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
    const startDocsRegisterResponse = await CLIENT.docs.v1.write.startDocsRegister({
        orgId: "fern",
        domain: "docs.fern.com",
        filepaths: ["logo.png", "guides/guide.mdx"],
    });
    await CLIENT.docs.v1.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
    // load docs
    const docs = await CLIENT.docs.v1.read.getDocsForDomain({
        domain: "docs.fern.com",
    });
    // assert docs have 2 file urls
    expect(Object.entries(docs.files)).toHaveLength(2);

    // re-register docs
    const startDocsRegisterResponse2 = await CLIENT.docs.v1.write.startDocsRegister({
        orgId: "fern",
        domain: "docs.fern.com",
        filepaths: [],
    });
    await CLIENT.docs.v1.write.finishDocsRegister(startDocsRegisterResponse2.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
});

it("docs register V2", async () => {
    // register docs
    const startDocsRegisterResponse = await CLIENT.docs.v2.write.startDocsRegister({
        orgId: "acme",
        apiId: "api",
        domain: "https://acme.docs.buildwithfern.com",
        customDomains: ["https://docs.useacme.com/docs"],
        filepaths: ["logo.png", "guides/guide.mdx", "fonts/Syne.woff2"],
    });
    await CLIENT.docs.v2.write.finishDocsRegister(startDocsRegisterResponse.docsRegistrationId, {
        docsDefinition: WRITE_DOCS_REGISTER_DEFINITION,
    });
    // load docs
    let docs = await CLIENT.docs.v2.read.getDocsForUrl({
        url: "https://acme.docs.buildwithfern.com/my/random/slug",
    });
    expect(docs.baseUrl.domain).toEqual("acme.docs.buildwithfern.com");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);
    expect(docs.definition.config.typography).toEqual({
        headingsFont: {
            name: "Syne",
            fontFile: fontFileId,
        },
    });
    // load docs again
    docs = await CLIENT.docs.v2.read.getDocsForUrl({
        url: "https://docs.useacme.com/docs/1/",
    });
    expect(docs.baseUrl.domain).toEqual("docs.useacme.com");
    expect(docs.baseUrl.basePath).toEqual("/docs");
    expect(Object.entries(docs.definition.files)).toHaveLength(3);

    //re-register docs
    const startDocsRegisterResponse2 = await CLIENT.docs.v2.write.startDocsRegister({
        orgId: "acme",
        apiId: "api",
        domain: "https://acme.docs.buildwithfern.com",
        customDomains: ["https://docs.useacme.com"],
        filepaths: [],
    });
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
                            method: FernRegistry.EndpointMethod.Get,
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
                            method: FernRegistry.EndpointMethod.Get,
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
    const response = await serverApp?.dao.snippets().loadSnippets({
        loadSnippetsInfo: {
            orgId: "acme",
            apiId: "api",
            endpointIdentifier: {
                path: "/users/v1",
                method: FernRegistry.EndpointMethod.Get,
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
});

it("get snippets", async () => {
    // register API definition for acme org
    await CLIENT.api.v1.register.registerApiDefinition({
        orgId: "acme",
        apiId: "petstore",
        definition: EMPTY_REGISTER_API_DEFINITION,
    });
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
                        method: FernRegistry.EndpointMethod.Get,
                    },
                    snippet: {
                        client: "const petstore = new PetstoreClient({\napiKey: 'YOUR_API_KEY',\n});",
                    },
                },
            ],
        },
    });
    // get snippets
    const snippets = await CLIENT.get({
        apiId: "petstore",
        endpoint: {
            path: "/users/v1",
            method: FernRegistry.EndpointMethod.Get,
        },
    });
    expect(snippets.length).toEqual(1);

    const snippet = snippets[0] as FernRegistry.TypeScriptSnippet;
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
    const snippets: FernRegistry.SingleTypescriptSnippetCreate[] = [];
    for (let i = 0; i < DEFAULT_SNIPPETS_PAGE_SIZE * 2; i++) {
        snippets.push({
            endpoint: {
                path: `/users/v${i}`,
                method: FernRegistry.EndpointMethod.Get,
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
            snippets: snippets,
        },
    });
    // load snippets (first page)
    const firstResponse = await CLIENT.load({
        apiId: "petstore",
    });
    expect(firstResponse.next).toEqual(2);
    expect(Object.keys(firstResponse.snippets).length).toEqual(DEFAULT_SNIPPETS_PAGE_SIZE);

    for (let i = 0; i < DEFAULT_SNIPPETS_PAGE_SIZE; i++) {
        const snippetsForEndpointMethod = firstResponse.snippets[`/users/v${i}`];
        const responseSnippets = snippetsForEndpointMethod?.GET;
        expect(responseSnippets?.length).toEqual(1);
        if (responseSnippets === undefined) {
            throw new Error("response snippets must not be undefined");
        }
        const snippet = responseSnippets[0] as FernRegistry.TypeScriptSnippet;
        expect(snippet.sdk.package).toEqual("acme");
        expect(snippet.sdk.version).toEqual("0.0.1");
        expect(snippet.client).toEqual(`const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`);
    }

    // load snippets (second page)
    const secondResponse = await CLIENT.load({
        apiId: "petstore",
        page: firstResponse.next,
    });
    expect(Object.keys(secondResponse.snippets).length).toEqual(DEFAULT_SNIPPETS_PAGE_SIZE);

    for (let i = DEFAULT_SNIPPETS_PAGE_SIZE; i < DEFAULT_SNIPPETS_PAGE_SIZE * 2; i++) {
        const snippetsForEndpointMethod = secondResponse.snippets[`/users/v${i}`];
        const responseSnippets = snippetsForEndpointMethod?.GET;
        expect(responseSnippets?.length).toEqual(1);
        if (responseSnippets === undefined) {
            throw new Error("response snippets must not be undefined");
        }
        const snippet = responseSnippets[0] as FernRegistry.TypeScriptSnippet;
        expect(snippet.sdk.package).toEqual("acme");
        expect(snippet.sdk.version).toEqual("0.0.1");
        expect(snippet.client).toEqual(`const clientV${i} = new UserClient({\napiKey: 'YOUR_API_KEY',\n});`);
    }
    expect(secondResponse.next).toEqual(3);
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
                        method: FernRegistry.EndpointMethod.Get,
                    },
                    snippet: {
                        client: "client := userclient.New(userclient.WithAuthToken('YOUR_AUTH_TOKEN')",
                    },
                },
            ],
        },
    });
    // get snippets
    let unauthorizedErrorThrown = false;
    try {
        await UNAUTHENTICATED_CLIENT.get({
            apiId: "user",
            endpoint: {
                path: "/users/v1",
                method: FernRegistry.EndpointMethod.Get,
            },
        });
    } catch (err: unknown) {
        unauthorizedErrorThrown = err instanceof FernRegistryError && err.statusCode == 401;
    }
    expect(unauthorizedErrorThrown).toEqual(true);
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
                        method: FernRegistry.EndpointMethod.Get,
                    },
                    snippet: {
                        client: "const acme = new AcmeClient({\napiKey: 'YOUR_API_KEY',\n});",
                    },
                },
            ],
        },
    });
    // get not found apiId
    let notFoundErrorThrown = false;
    try {
        await CLIENT.get({
            apiId: "dne",
            endpoint: {
                path: "/users/v1",
                method: FernRegistry.EndpointMethod.Get,
            },
        });
    } catch (err: unknown) {
        notFoundErrorThrown = err instanceof FernRegistryError && err.statusCode == 404;
    }
    expect(notFoundErrorThrown).toEqual(true);
});
