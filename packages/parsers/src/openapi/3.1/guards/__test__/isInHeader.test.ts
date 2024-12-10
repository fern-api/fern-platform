import { isInHeader } from "../isInHeader";

describe("isInHeader", () => {
    it("returns true when input has in: 'header'", () => {
        const input = { in: "header" };
        expect(isInHeader(input)).toBe(true);
    });

    it("returns false when input has different 'in' value", () => {
        const input = { in: "query" };
        expect(isInHeader(input)).toBe(false);
    });

    it("returns false when input is missing 'in' property", () => {
        const input = { foo: "bar" };
        expect(isInHeader(input)).toBe(false);
    });

    it("returns false when input is null", () => {
        expect(isInHeader(null)).toBe(false);
    });

    it("returns false when input is undefined", () => {
        expect(isInHeader(undefined)).toBe(false);
    });

    it("returns false when input is not an object", () => {
        const inputs = [123, "string", true, []];
        for (const input of inputs) {
            expect(isInHeader(input)).toBe(false);
        }
    });
});
