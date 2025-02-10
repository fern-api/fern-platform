import { OpenAPIV3_1 } from "openapi-types";

import { isNumberSchema } from "../isNumberSchema";

describe("isNumberSchema", () => {
  it("should return true if the input is a number schema", () => {
    const input = { type: "number" } as OpenAPIV3_1.SchemaObject;
    expect(isNumberSchema(input)).toBe(true);
  });
});
