import { OpenAPIV3_1 } from "openapi-types";
import { isNullSchema } from "../isNullSchema";

describe("isNullSchema", () => {
  it("should return true if the input is a null schema", () => {
    const input = { type: "null" } as OpenAPIV3_1.SchemaObject;
    expect(isNullSchema(input)).toBe(true);
  });
});
