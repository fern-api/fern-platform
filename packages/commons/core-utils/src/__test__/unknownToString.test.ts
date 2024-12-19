import { unknownToString } from "../unknownToString";

describe("unknownToString", () => {
    it("should preserve strings", () => {
        expect(unknownToString("foo")).toBe("foo");
    });

    it("should convert booleans to strings", () => {
        expect(unknownToString(true)).toBe("true");
        expect(unknownToString(false)).toBe("false");
    });

    it("should convert numbers to strings", () => {
        expect(unknownToString(42)).toBe("42");
        expect(unknownToString(3.14)).toBe("3.14");
        expect(unknownToString(1_000_000_000_000_000_000)).toBe(
            "1000000000000000000"
        );
    });

    it("should convert nulls", () => {
        expect(unknownToString(null)).toBe("");
        expect(unknownToString(undefined)).toBe("");
        expect(unknownToString(null, { renderNull: true })).toBe("null");
        expect(unknownToString(undefined, { renderNull: true })).toBe("null");
    });

    it("should convert objects to JSON strings", () => {
        expect(unknownToString({ foo: "bar" })).toBe('{"foo":"bar"}');
    });

    it("should convert arrays to JSON strings", () => {
        expect(unknownToString([1, 2, 3])).toBe("[1,2,3]");
    });

    it("should not render functions", () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(unknownToString(() => {})).toBe("");
    });
});
