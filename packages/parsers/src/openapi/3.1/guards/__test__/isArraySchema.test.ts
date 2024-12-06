import { OpenAPIV3_1 } from "openapi-types";
import { isArraySchema } from "../isArraySchema";

describe("isArraySchema", () => {
    it("should return true if the input is an array schema", () => {
        const input = { type: "array" } as OpenAPIV3_1.SchemaObject;
        expect(isArraySchema(input)).toBe(true);
    });
});
