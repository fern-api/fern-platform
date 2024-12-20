import { OpenAPIV3_1 } from "openapi-types";
import { isObjectSchema } from "../isObjectSchema";

describe("isObjectSchema", () => {
  it("should return true if the input is an object schema", () => {
    const input = { type: "object" } as OpenAPIV3_1.SchemaObject;
    expect(isObjectSchema(input)).toBe(true);
  });
});
