import { expect } from "vitest";
import { proxyGrpc } from "../functions/grpc-proxy/proxyGrpc";

const AWS_BUCKET_NAME = "fdr-api-definition-source-test";
const AWS_OBJECT_KEY = "fern/fern/2024-08-11T22:35:49.980Z/f6ea473b-1884-4ccc-b386-113cbff139d1";

interface ElizaResponse {
    sentence: string;
}

interface CreateUserRequest {
    username: string;
    email: string;
    age: number;
    weight: number;
    metadata: object;
}

it("unary w/ gRPC server reflection", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await proxyGrpc({
        body: {
            baseUrl: "https://demo.connectrpc.com",
            endpoint: "connectrpc.eliza.v1.ElizaService/Say",
            headers: {},
            body: {
                sentence: "Feeling happy? Tell me more.",
            },
        },
    });

    expect(response).not.toBe(null);

    const elizaResponse = response as ElizaResponse;
    expect(elizaResponse.sentence).not.toBe(null);
});

it("invalid schema", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await proxyGrpc({
        body: {
            baseUrl: "https://demo.connectrpc.com",
            endpoint: "connectrpc.eliza.v1.ElizaService/Say",
            headers: {},
            schema: {
                sourceUrl: `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${AWS_OBJECT_KEY}`,
            },
            body: {
                sentence: "Feeling happy? Tell me more.",
            },
        },
    });

    expect(response).not.toBe(null);
    expect(response).toEqual(`Failure: failed to find service named "connectrpc.eliza.v1.ElizaService" in schema`);

    const elizaResponse = response as ElizaResponse;
    expect(elizaResponse.sentence).toBe(undefined);
});

it("invalid host", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await proxyGrpc({
        body: {
            baseUrl: "https://demo.connectrpc.com",
            endpoint: "user.v1.User/Create",
            headers: {},
            schema: {
                sourceUrl: `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${AWS_OBJECT_KEY}`,
            },
            body: {
                username: "john.doe",
                email: "john.doe@gmail.com",
                age: 42,
                weight: 180.5,
                metadata: {
                    foo: "bar",
                },
            } as CreateUserRequest,
        },
    });

    expect(response).not.toBe(null);
    expect(response).toEqual(`{
   "code": "unknown",
   "message": "HTTP status 302 Found"
}`);

    const elizaResponse = response as ElizaResponse;
    expect(elizaResponse.sentence).toBe(undefined);
});
