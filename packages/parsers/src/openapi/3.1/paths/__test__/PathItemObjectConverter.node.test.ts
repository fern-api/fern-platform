import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { PathItemObjectConverterNode } from "../PathItemObjectConverter.node";

describe("PathItemObjectConverterNode", () => {
  const mockContext = createMockContext();

  describe("convert", () => {
    it("should convert path item with multiple operations", () => {
      const input: OpenAPIV3_1.PathItemObject = {
        description: "Pet operations",
        get: {
          description: "Get a pet",
          parameters: [
            {
              name: "petId",
              in: "path",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "A pet to be returned",
            },
          },
        },
        post: {
          description: "Create a pet",
          responses: {
            "200": {
              description: "A pet to be returned",
            },
          },
        },
      };

      const node = new PathItemObjectConverterNode(
        {
          input,
          context: mockContext,
          accessPath: [],
          pathId: "/pets/{petId}",
        },
        undefined,
        undefined,
        undefined,
        undefined
      );

      const result = node.convert();

      expect(result).toHaveLength(2);
      expect(result?.[0]).toEqual({
        description: "Get a pet",
        id: "endpoint_.petId",
        method: "GET",
        path: [
          {
            type: "literal",
            value: "/",
          },
          {
            type: "literal",
            value: "pets",
          },
          {
            type: "literal",
            value: "/",
          },
          {
            type: "pathParameter",
            value: "petId",
          },
        ],
        environments: [],
        pathParameters: [
          {
            key: "petId",
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
        errors: [],
      });
      expect(result?.[1]).toEqual({
        description: "Create a pet",
        id: "endpoint_.petId",
        method: "POST",
        path: [
          {
            type: "literal",
            value: "/",
          },
          {
            type: "literal",
            value: "pets",
          },
          {
            type: "literal",
            value: "/",
          },
          {
            type: "pathParameter",
            value: "petId",
          },
        ],
        environments: [],
        errors: [],
      });
    });

    it("should handle path item with no operations", () => {
      const input: OpenAPIV3_1.PathItemObject = {
        description: "Empty path",
      };

      const node = new PathItemObjectConverterNode(
        {
          input,
          context: mockContext,
          accessPath: [],
          pathId: "/empty",
        },
        undefined,
        undefined,
        undefined,
        undefined
      );

      const result = node.convert();
      expect(result).toEqual([]);
    });

    it("should handle path item with servers", () => {
      const mockServer: OpenAPIV3_1.ServerObject = {
        url: "https://api.example.com",
      };

      const input: OpenAPIV3_1.PathItemObject = {
        servers: [mockServer],
        get: {
          description: "Test endpoint",
          responses: {
            "200": {
              description: "A pet to be returned",
            },
          },
        },
      };

      const node = new PathItemObjectConverterNode(
        {
          input,
          context: mockContext,
          accessPath: [],
          pathId: "/test",
        },
        undefined,
        undefined,
        undefined,
        undefined
      );

      const result = node.convert();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual(
        expect.objectContaining({
          description: "Test endpoint",
          method: "GET",
        })
      );
    });
  });
});
