import { PrismaClient } from "@prisma/client";
import express from "express";
import http from "http";
import { AuthUtils } from "../../AuthUtils";
import { S3UtilsImpl } from "../../S3Utils";
import { FdrConfig } from "../../config";
import { register } from "../../generated";
import { getReadApiService } from "../../services/api/getApiReadService";
import { getRegisterApiService } from "../../services/api/getRegisterApiService";
import { getDocsReadService } from "../../services/docs/getDocsReadService";
import { getDocsWriteService } from "../../services/docs/getDocsWriteService";
import { FernRegistry, FernRegistryClient } from "../generated";

const PORT = 9999;

class MockAuthUtils implements AuthUtils {
    async checkUserBelongsToOrg(): Promise<void> {
        return;
    }
}

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
    const authUtils = new MockAuthUtils();
    const config: FdrConfig = {
        awsAccessKey: "",
        awsSecretKey: "",
        s3BucketName: "fdr",
        s3BucketRegion: "us-east-1",
        venusUrl: "",
        s3UrlOverride: "http://s3-mock:9090",
    };
    const s3Utils = new S3UtilsImpl(config);
    register(app, {
        docs: {
            v1: {
                read: getDocsReadService(prisma, s3Utils),
                write: getDocsWriteService(prisma, authUtils, s3Utils),
            },
        },
        api: {
            v1: {
                read: getReadApiService(prisma),
                register: getRegisterApiService(prisma, authUtils),
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

const WRITE_DOCS_REGISTER_DEFINITION: FernRegistry.docs.v1.write.DocsDefinition = {
    pages: {},
    config: {
        navigation: {
            items: [],
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
