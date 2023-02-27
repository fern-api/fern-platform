import { PrismaClient } from "@prisma/client";
import express from "express";
import http from "http";
import { AuthUtils } from "../../AuthUtils";
import { register } from "../../generated";
import { getEnvironmentService } from "../../services/environment";
import { getRegistryService } from "../../services/registry";
import { FernRegistry, FernRegistryClient } from "../generated";
import { ApiDefinition } from "../generated/api";

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
    register(app, {
        registry: getRegistryService(prisma, authUtils),
        environment: getEnvironmentService(prisma, authUtils),
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

it("environment crud", async () => {
    // create environment
    const environmentId = await CLIENT.environment.create("fern", {
        name: "Production",
        url: "https://buildwithfern.com/",
    });
    // check it exists
    const response = await CLIENT.environment.getAll("fern");
    const shouldContainEnvironment = response.environments.some((env) => {
        return env.id === environmentId;
    });
    expect(shouldContainEnvironment).toEqual(true);
    // delete environment
    await CLIENT.environment.delete("fern", environmentId);
    const postDeletedResponse = await CLIENT.environment.getAll("fern");
    const shouldNotContainEnvironment = postDeletedResponse.environments.some((env) => {
        return env.id === environmentId;
    });
    // check it does not exist
    expect(shouldNotContainEnvironment).toEqual(false);
});

const EMPTY_API_DEFINITION: ApiDefinition = {
    rootPackage: {
        endpoints: [],
        types: [],
        subpackages: [],
    },
    subpackages: {},
    types: {},
};

const MOCK_API_DEFINITION: ApiDefinition = {
    rootPackage: {
        endpoints: [
            {
                id: "dummy",
                path: {
                    parts: [FernRegistry.EndpointPathPart.literal("dummy")],
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

it("definition crud", async () => {
    // create environment
    const environmentId = await CLIENT.environment.create("fern", {
        name: "Production",
        url: "https://buildwithfern.com/",
    });

    // register api
    await CLIENT.registry.registerApi("fern", "fdr", {
        apiName: "Fern Definition Registry",
        environmentId,
        apiDefinition: MOCK_API_DEFINITION,
    });

    // load metadata
    const fdrApiMetadata = await CLIENT.registry.getApiMetadata("fern", "fdr");
    expect(fdrApiMetadata.name).toEqual("Fern Definition Registry");

    // register api more times
    await CLIENT.registry.registerApi("fern", "fdr", {
        apiName: "Fern Definition Registry",
        environmentId,
        apiDefinition: MOCK_API_DEFINITION,
    });

    await CLIENT.registry.registerApi("fern", "fdr", {
        apiName: "Fern Definition Registry",
        environmentId,
        apiDefinition: MOCK_API_DEFINITION,
    });

    // register noop api
    await CLIENT.registry.registerApi("fern", "noop", {
        apiName: "NOOP",
        environmentId,
        apiDefinition: EMPTY_API_DEFINITION,
    });

    // load all apis
    const allMetadatas = await CLIENT.registry.getAllApiMetadata("fern");
    expect(allMetadatas.apis.length).toEqual(2);

    const fdrMetadata = allMetadatas.apis.find((metadata) => {
        return metadata.id == "fdr";
    });
    expect(fdrMetadata != null).toEqual(true);

    const noopMetadata = allMetadatas.apis.find((metadata) => {
        return metadata.id == "noop";
    });
    expect(noopMetadata != null).toEqual(true);

    // load api definition
    const apiDefinition = await CLIENT.registry.getApiWithEnvironment("fern", "fdr", environmentId);
    expect(JSON.stringify(apiDefinition)).toEqual(JSON.stringify(MOCK_API_DEFINITION));
});
