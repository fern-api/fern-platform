import { isRecord } from "../isRecord";

describe("isRecord", () => {
    it("should return true for plain objects", () => {
        const input = { key: "value" };
        expect(isRecord(input)).toBe(true);
    });

    it("should return false if input is null", () => {
        expect(isRecord(null)).toBe(false);
    });

    it("should return false if input is undefined", () => {
        expect(isRecord(undefined)).toBe(false);
    });

    it("should return false if input is an array", () => {
        expect(isRecord([])).toBe(false);
        expect(isRecord([1, 2, 3])).toBe(false);
    });

    it("should return false for primitive types", () => {
        expect(isRecord("string")).toBe(false);
        expect(isRecord(123)).toBe(false);
        expect(isRecord(true)).toBe(false);
    });

    it("should return true for empty objects", () => {
        expect(isRecord({})).toBe(true);
    });

    it("should return true for nested objects", () => {
        const input = { a: { b: { c: "value" } } };
        expect(isRecord(input)).toBe(true);
    });
});
