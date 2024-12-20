import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { FernRegistry } from "../../../../client/generated";
import { ServerObjectConverterNode } from "../ServerObjectConverter.node";

describe("ServerObjectConverterNode", () => {
    const mockContext = createMockContext();

    describe("constructor", () => {
        it("should initialize with valid server object", () => {
            const input: OpenAPIV3_1.ServerObject = {
                url: "https://api.example.com",
            };
            const node = new ServerObjectConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.url).toBe("https://api.example.com");
        });
    });

    describe("convert", () => {
        it("should convert server object to environment", () => {
            const input: OpenAPIV3_1.ServerObject = {
                url: "https://api.example.com",
            };
            const node = new ServerObjectConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            const result = node.convert();
            expect(result).toEqual({
                id: FernRegistry.EnvironmentId("https://api.example.com"),
                baseUrl: "https://api.example.com",
            });
        });
    });
});
