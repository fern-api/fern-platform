import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../../client/generated";
import { createMockContext } from "../../../__test__/createMockContext.util";
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
        undefined,
        "/pets/{petId}",
        "GET",
        undefined
      );

      const result = node.convert();

      expect(result).toEqual({
        description: "Get a pet",
        id: "endpoint_.petId",
        method: "GET",
        path: [
          { type: "literal", value: "/" },
          { type: "literal", value: "pets" },
          { type: "literal", value: "/" },
          { type: "pathParameter", value: FernRegistry.PropertyKey("petId") },
        ],
        environments: [],
        pathParameters: [
          {
            key: FernRegistry.PropertyKey("petId"),
            valueShape: {
              type: "alias",
              value: {
                type: "optional",
                shape: {
                  type: "alias",
                  value: {
                    type: "primitive",
                    value: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
      });
    });

    it("should handle undefined path", () => {
      const input: OpenAPIV3_1.OperationObject = {
        description: "Test operation",
      };

      const path = undefined as unknown as string;
      const node = new OperationObjectConverterNode(
        {
          input,
          context: mockContext,
          accessPath: [],
          pathId: "test",
        },
        undefined,
        undefined,
        path,
        "GET",
        undefined,
        undefined
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
        undefined,
        "/users/{userId}/posts/{postId}",
        "GET",
        undefined
      );

      const result = node.convertPathToPathParts();

      expect(result).toEqual([
        { type: "literal", value: "/" },
        { type: "literal", value: "users" },
        { type: "literal", value: "/" },
        { type: "pathParameter", value: FernRegistry.PropertyKey("userId") },
        { type: "literal", value: "/" },
        { type: "literal", value: "posts" },
        { type: "literal", value: "/" },
        { type: "pathParameter", value: FernRegistry.PropertyKey("postId") },
      ]);
    });
  });
});
