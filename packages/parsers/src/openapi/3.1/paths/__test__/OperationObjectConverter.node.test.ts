import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { OperationObjectConverterNode } from "../OperationObjectConverter.node";

describe("OperationObjectConverterNode", () => {
    const mockContext = createMockContext();

    describe("convert", () => {
        it("should convert basic GET operation", () => {
            const input: OpenAPIV3_1.OperationObject = {
                description: "Get a pet",
                parameters: [
                    {
                        name: "petId",
                        in: "path",
                        schema: { type: "string" },
                    },
                ],
            };

            const node = new OperationObjectConverterNode(
                {
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                },
                undefined,
                "/pets/{petId}",
                "GET",
            );

            const result = node.convert();

            expect(result).toEqual({
                description: "Get a pet",
                id: FdrAPI.EndpointId("/pets/{petId}"),
                method: "GET",
                path: [
                    { type: "literal", value: "pets" },
                    { type: "pathParameter", value: FdrAPI.PropertyKey("petId") },
                ],
                environments: [],
                pathParameters: [
                    {
                        key: FdrAPI.PropertyKey("petId"),
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                ],
                responseHeaders: [],
                errors: [],
                examples: [],
            });
        });

        it("should handle undefined path", () => {
            const input: OpenAPIV3_1.OperationObject = {
                description: "Test operation",
            };

            const node = new OperationObjectConverterNode(
                {
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                },
                undefined,
                undefined,
                "GET",
            );

            const result = node.convert();
            expect(result).toBeUndefined();
        });
    });

    describe("convertPathToPathParts", () => {
        it("should convert path with parameters", () => {
            const node = new OperationObjectConverterNode(
                {
                    input: {},
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                },
                undefined,
                "/users/{userId}/posts/{postId}",
                "GET",
            );

            const result = node.convertPathToPathParts();

            expect(result).toEqual([
                { type: "literal", value: "users" },
                { type: "pathParameter", value: FdrAPI.PropertyKey("userId") },
                { type: "literal", value: "posts" },
                { type: "pathParameter", value: FdrAPI.PropertyKey("postId") },
            ]);
        });
    });
});
