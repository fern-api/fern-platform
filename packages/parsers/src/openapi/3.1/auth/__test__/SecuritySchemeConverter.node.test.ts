import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../__test__/createMockContext.util";
import { SecuritySchemeConverterNode } from "../SecuritySchemeConverter.node";

describe("SecuritySchemeConverterNode", () => {
  const mockContext = createMockContext();

  describe("basic auth", () => {
    it("should parse basic auth with username and password", () => {
      const input = {
        type: "http",
        scheme: "basic",
        "x-fern-basic": {
          username: {
            name: "myUsername",
          },
          password: {
            name: "myPassword",
          },
        },
      } as OpenAPIV3_1.HttpSecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const converted = node.convert();
      expect(converted).toEqual({
        type: "basicAuth",
        usernameName: "myUsername",
        passwordName: "myPassword",
      });
    });

    it("should parse basic auth with variable names", () => {
      const input = {
        type: "http",
        scheme: "basic",
        "x-fern-username-variable-name": "USERNAME_VAR",
        "x-fern-password-variable-name": "PASSWORD_VAR",
      } as OpenAPIV3_1.HttpSecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const converted = node.convert();
      expect(converted).toEqual({
        type: "basicAuth",
        usernameName: "USERNAME_VAR",
        passwordName: "PASSWORD_VAR",
      });
    });

    it("should warn if username/password not provided", () => {
      const input = {
        type: "http",
        scheme: "basic",
      } as OpenAPIV3_1.HttpSecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      node.convert();

      expect(mockContext.errors.warning).toHaveBeenCalledWith({
        message:
          "Basic auth should specify either a username or a username variable name",
        path: ["test"],
      });
    });
  });

  describe("bearer auth", () => {
    it("should parse bearer auth with token", () => {
      const input = {
        type: "http",
        scheme: "bearer",
        "x-fern-bearer": {
          name: "myToken",
        },
      } as OpenAPIV3_1.HttpSecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const converted = node.convert();
      expect(converted).toEqual({
        type: "bearerAuth",
        tokenName: "myToken",
      });
    });

    it("should parse bearer auth with variable name", () => {
      const input = {
        type: "http",
        scheme: "bearer",
        "x-fern-token-variable-name": "TOKEN_VAR",
      } as OpenAPIV3_1.HttpSecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const converted = node.convert();
      expect(converted).toEqual({
        type: "bearerAuth",
        tokenName: "TOKEN_VAR",
      });
    });

    it("should parse bearer auth with no extension", () => {
      const input = {
        type: "http",
        scheme: "bearer",
      } as OpenAPIV3_1.HttpSecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const converted = node.convert();
      expect(converted).toEqual({
        type: "bearerAuth",
        tokenName: undefined,
      });
    });
  });

  describe("header auth", () => {
    it("should parse header auth", () => {
      const input = {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        "x-fern-header": {
          name: "customHeader",
        },
      } as OpenAPIV3_1.ApiKeySecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const converted = node.convert();
      expect(converted).toEqual({
        headerWireValue: "X-API-Key",
        type: "header",
        nameOverride: "customHeader",
      });
    });

    it("should error on non-header API key", () => {
      const input = {
        type: "apiKey",
        in: "query",
        name: "api_key",
      } as OpenAPIV3_1.ApiKeySecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      node.convert();

      expect(mockContext.errors.error).toHaveBeenCalledWith({
        message: "Unsupported API key location: query",
        path: ["test"],
      });
    });
  });

  describe("oauth2", () => {
    it("should parse OAuth2 auth", () => {
      const input = {
        type: "oauth2",
        flows: {
          clientCredentials: {
            tokenUrl: "https://api.example.com/oauth/token",
            scopes: {},
          },
        },
        "x-fern-access-token-locator": "$.body.access_token",
      } as OpenAPIV3_1.OAuth2SecurityScheme;

      const node = new SecuritySchemeConverterNode({
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
            endpointId: "endpoint_.postHttpsApiExampleComOauthToken",
            accessTokenLocator: "$.body.access_token",
            headerName: "Authorization",
          },
        },
      });
    });

    it("should fail OAuth2 auth without access token locator", () => {
      const input = {
        type: "oauth2",
        flows: {
          clientCredentials: {
            tokenUrl: "https://api.example.com/oauth/token",
            scopes: {},
          },
        },
      } as OpenAPIV3_1.OAuth2SecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      node.convert();

      expect(mockContext.errors.error).toHaveBeenCalledWith({
        message:
          "Expected 'x-fern-access-token-locator' property to be specified",
        path: ["test"],
      });
    });
  });

  describe("openIdConnect", () => {
    it("should parse OpenID Connect as bearer auth", () => {
      const input = {
        type: "openIdConnect",
        openIdConnectUrl:
          "https://example.com/.well-known/openid-configuration",
      } as OpenAPIV3_1.OpenIdSecurityScheme;

      const node = new SecuritySchemeConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const converted = node.convert();
      expect(converted).toEqual({
        type: "bearerAuth",
        tokenName: undefined,
      });
    });
  });

  it("should handle unsupported HTTP schemes", () => {
    const input = {
      type: "http",
      scheme: "digest",
    } as OpenAPIV3_1.HttpSecurityScheme;

    const node = new SecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    node.convert();

    expect(mockContext.errors.warning).toHaveBeenCalledWith({
      message: "Unsupported HTTP auth scheme: digest",
      path: ["test"],
    });
  });
});
