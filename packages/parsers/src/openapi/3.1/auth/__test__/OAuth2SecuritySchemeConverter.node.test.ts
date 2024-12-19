import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { OAuth2SecuritySchemeConverterNode } from "../OAuth2SecuritySchemeConverter.node";

describe("OAuth2SecuritySchemeConverterNode", () => {
  const mockContext = createMockContext();

  it("should parse OAuth2 client credentials flow", () => {
    const input = {
      type: "oauth2",
      flows: {
        clientCredentials: {
          tokenUrl: "https://api.example.com/oauth/token",
          scopes: {},
        },
      },
      "x-fern-access-token-locator": "$.access_token",
      "x-fern-header": {
        name: "Authorization",
        prefix: "Bearer",
      },
    } as OpenAPIV3_1.OAuth2SecurityScheme;

    const node = new OAuth2SecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    const converted = node.convert();
    expect(converted).toEqual({
      type: "oAuth",
      value: {
        type: "clientCredentials",
        value: {
          type: "referencedEndpoint",
          endpointId: "post-https-api-example-com-oauth-token",
          accessTokenLocator: "$.access_token",
          headerName: "Authorization",
          tokenPrefix: "Bearer",
        },
      },
    });
  });

  it("should handle missing token URL", () => {
    const input = {
      type: "oauth2",
      flows: {
        clientCredentials: {
          scopes: {},
        },
      },
    } as OpenAPIV3_1.OAuth2SecurityScheme;

    const node = new OAuth2SecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.convert()).toBeUndefined();
    expect(mockContext.errors.error).toHaveBeenCalledWith({
      message: "Expected 'tokenUrl' property to be specified",
      path: ["test"],
    });
  });

  it("should handle missing access token locator", () => {
    const input = {
      type: "oauth2",
      flows: {
        clientCredentials: {
          tokenUrl: "https://api.example.com/oauth/token",
          scopes: {},
        },
      },
    } as OpenAPIV3_1.OAuth2SecurityScheme;

    const node = new OAuth2SecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.convert()).toBeUndefined();
  });

  it("should handle missing client credentials flow", () => {
    const input = {
      type: "oauth2",
      flows: {},
    } as OpenAPIV3_1.OAuth2SecurityScheme;

    const node = new OAuth2SecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.convert()).toBeUndefined();
  });
});
