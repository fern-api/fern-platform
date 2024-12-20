import { isNonArraySchema } from "../isNonArraySchema";

describe("isNonArraySchema", () => {
    it("should return true for non-array schema", () => {
        const input = { type: "string" };
        expect(isNonArraySchema(input)).toBe(true);
    });

    it("should return false if type is an array", () => {
        const input = { type: ["string", "null"] };
        expect(isNonArraySchema(input)).toBe(false);
    });

    it("should return false if schema is array type", () => {
        const input = { type: "array", items: { type: "string" } };
        expect(isNonArraySchema(input)).toBe(false);
    });

    it("should return true for object type schema", () => {
        const input = { type: "object", properties: { foo: { type: "string" } } };
        expect(isNonArraySchema(input)).toBe(true);
    });

    it("should return true for primitive type schemas", () => {
        expect(isNonArraySchema({ type: "string" })).toBe(true);
        expect(isNonArraySchema({ type: "number" })).toBe(true);
        expect(isNonArraySchema({ type: "boolean" })).toBe(true);
        expect(isNonArraySchema({ type: "null" })).toBe(true);
    });
});
