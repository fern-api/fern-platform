import { OpenAPIV3_1 } from "openapi-types";
import { isBooleanSchema } from "../isBooleanSchema";

describe("isBooleanSchema", () => {
    it("should return true if the input is a boolean schema", () => {
        const input = { type: "boolean" } as OpenAPIV3_1.SchemaObject;
        expect(isBooleanSchema(input)).toBe(true);
    });
});
