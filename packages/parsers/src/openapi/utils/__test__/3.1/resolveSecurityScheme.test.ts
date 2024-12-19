import { OpenAPIV3_1 } from "openapi-types";
import { resolveSecurityScheme } from "../../3.1/resolveSecurityScheme";

describe("resolveSecurityScheme", () => {
  it("returns undefined when security scheme is not found", () => {
    const document: OpenAPIV3_1.Document = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      paths: {},
    };
    expect(resolveSecurityScheme("nonexistent", document)).toBeUndefined();
  });

  it("returns the security scheme directly when not a reference", () => {
    const securityScheme: OpenAPIV3_1.SecuritySchemeObject = {
      type: "http",
      scheme: "basic",
    };
    const document: OpenAPIV3_1.Document = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      paths: {},
      components: {
        securitySchemes: {
          basicAuth: securityScheme,
        },
      },
    };
    expect(resolveSecurityScheme("basicAuth", document)).toBe(securityScheme);
  });

  it("resolves referenced security scheme", () => {
    const referencedScheme: OpenAPIV3_1.SecuritySchemeObject = {
      type: "apiKey",
      in: "header",
      name: "X-API-Key",
    };
    const document: OpenAPIV3_1.Document = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      paths: {},
      components: {
        securitySchemes: {
          apiKey: {
            $ref: "#/components/securitySchemes/referencedApiKey",
          },
          referencedApiKey: referencedScheme,
        },
      },
    };
    expect(resolveSecurityScheme("apiKey", document)).toEqual(referencedScheme);
  });

  it("returns undefined when referenced security scheme doesn't exist", () => {
    const document: OpenAPIV3_1.Document = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      paths: {},
      components: {
        securitySchemes: {
          apiKey: {
            $ref: "#/components/securitySchemes/nonexistent",
          },
        },
      },
    };
    expect(resolveSecurityScheme("apiKey", document)).toBeUndefined();
  });
});
