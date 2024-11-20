import { describe, expect, it } from "vitest";
import { isReferenceObject } from "../isReferenceObject";

describe("isReferenceObject", () => {
    it("returns true for valid reference object", () => {
        const input = {
            $ref: "#/components/schemas/Pet",
        };
        expect(isReferenceObject(input)).toBe(true);
    });

    it("returns false for null", () => {
        expect(isReferenceObject(null)).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(isReferenceObject(undefined)).toBe(false);
    });

    it("returns false if $ref is missing", () => {
        const input = {
            something: "else",
        };
        expect(isReferenceObject(input)).toBe(false);
    });

    it("returns false if $ref is not a string", () => {
        const input = {
            $ref: 123,
        };
        expect(isReferenceObject(input)).toBe(false);
    });

    it("returns false for non-object types", () => {
        expect(isReferenceObject("string")).toBe(false);
        expect(isReferenceObject(123)).toBe(false);
        expect(isReferenceObject(true)).toBe(false);
        expect(isReferenceObject([])).toBe(false);
    });
});
