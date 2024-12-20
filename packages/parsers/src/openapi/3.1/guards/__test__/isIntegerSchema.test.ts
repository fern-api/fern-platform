import { OpenAPIV3_1 } from "openapi-types";
import { isIntegerSchema } from "../isIntegerSchema";

describe("isIntegerSchema", () => {
  it("should return true if the input is an integer schema", () => {
    const input = { type: "integer" } as OpenAPIV3_1.SchemaObject;
    expect(isIntegerSchema(input)).toBe(true);
  });
});
