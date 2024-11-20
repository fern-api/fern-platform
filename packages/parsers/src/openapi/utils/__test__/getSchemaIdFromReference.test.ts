import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { getSchemaIdFromReference } from "../getSchemaIdFromReference";

describe("getSchemaIdFromReference", () => {
    it("should extract schema ID from valid reference", () => {
        const ref: OpenAPIV3_1.ReferenceObject = {
            $ref: "#/components/schemas/Pet",
        };
        expect(getSchemaIdFromReference(ref)).toBe("Pet");
    });

    it("should handle nested schema references", () => {
        const ref: OpenAPIV3_1.ReferenceObject = {
            $ref: "#/components/schemas/Pet/Dog",
        };
        expect(getSchemaIdFromReference(ref)).toBe("Pet/Dog");
    });

    it("should return undefined for non-schema references", () => {
        const ref: OpenAPIV3_1.ReferenceObject = {
            $ref: "#/components/parameters/PetId",
        };
        expect(getSchemaIdFromReference(ref)).toBeUndefined();
    });

    it("should return undefined for invalid reference format", () => {
        const ref: OpenAPIV3_1.ReferenceObject = {
            $ref: "invalid/reference",
        };
        expect(getSchemaIdFromReference(ref)).toBeUndefined();
    });
});
