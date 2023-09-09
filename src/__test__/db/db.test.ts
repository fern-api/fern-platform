import { PrismaClient } from "@prisma/client";
import express from "express";
import http from "http";
import { uniqueId } from "lodash";
import { getReadApiService } from "../../controllers/api/getApiReadService";
import { getRegisterApiService } from "../../controllers/api/getRegisterApiService";
import { getDocsReadService } from "../../controllers/docs/getDocsReadService";
import { getDocsReadV2Service } from "../../controllers/docs/getDocsReadV2Service";
import { getDocsWriteService } from "../../controllers/docs/getDocsWriteService";
import { getDocsWriteV2Service } from "../../controllers/docs/getDocsWriteV2Service";
import { register } from "../../generated";
import { FernRegistry, FernRegistryClient } from "../generated";
import { createMockFdrApplication } from "../mock";

const PORT = 9999;

const CLIENT = new FernRegistryClient({
    environment: `http://localhost:${PORT}/`,
    token: "dummy",
});

const app = express();
const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
});
let server: http.Server | undefined;

beforeAll(async () => {
    const serverApp = createMockFdrApplication();
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

    //register updated definition
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

    //re-register docs
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
