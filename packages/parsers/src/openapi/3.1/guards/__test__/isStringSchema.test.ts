import { OpenAPIV3_1 } from "openapi-types";

import { isStringSchema } from "../isStringSchema";

describe("isStringSchema", () => {
  it("should return true if the input is a string schema", () => {
    const input = { type: "string" } as OpenAPIV3_1.SchemaObject;
    expect(isStringSchema(input)).toBe(true);
  });
});
