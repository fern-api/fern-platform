import { OpenAPIV3_1 } from "openapi-types";

export function isApiKeySecurityScheme(
  input: OpenAPIV3_1.SecuritySchemeObject
): input is OpenAPIV3_1.ApiKeySecurityScheme {
  return input.type === "apiKey";
}
