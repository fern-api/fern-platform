import { OpenAPIV3_1 } from "openapi-types";

import { isApiKeySecurityScheme } from "../isApiKeySecurityScheme";

describe("isApiKeySecurityScheme", () => {
  it("returns true for API key security scheme", () => {
    const input: OpenAPIV3_1.SecuritySchemeObject = {
      type: "apiKey",
      name: "api_key",
      in: "header",
    };
    expect(isApiKeySecurityScheme(input)).toBe(true);
  });

  it("returns false for other security scheme types", () => {
    const inputs: OpenAPIV3_1.SecuritySchemeObject[] = [
      {
        type: "http",
        scheme: "basic",
      },
      {
        type: "oauth2",
        flows: {},
      },
      {
        type: "openIdConnect",
        openIdConnectUrl:
          "https://example.com/.well-known/openid-configuration",
      },
    ];

    for (const input of inputs) {
      expect(isApiKeySecurityScheme(input)).toBe(false);
    }
  });
});
