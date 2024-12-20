import { isMixedSchema } from "../isMixedSchema";

describe("isMixedSchema", () => {
<<<<<<< HEAD
    it("should return true for array of valid schema types", () => {
        const input = [{ type: "null" }, { type: "string" }, { type: "array", items: { type: "string" } }];
        expect(isMixedSchema(input)).toBe(true);
    });

    it("should return false if input is null", () => {
        expect(isMixedSchema(null)).toBe(false);
    });

    it("should return false if input is undefined", () => {
        expect(isMixedSchema(undefined)).toBe(false);
    });

    it("should return false if input is not an array", () => {
        expect(isMixedSchema({ type: "string" })).toBe(false);
    });
=======
  it("should return true for array of valid schema types", () => {
    const input = [
      { type: "null" },
      { type: "string" },
      { type: "array", items: { type: "string" } },
    ];
    expect(isMixedSchema(input)).toBe(true);
  });

  it("should return false if input is null", () => {
    expect(isMixedSchema(null)).toBe(false);
  });

  it("should return false if input is undefined", () => {
    expect(isMixedSchema(undefined)).toBe(false);
  });

  it("should return false if input is not an array", () => {
    expect(isMixedSchema({ type: "string" })).toBe(false);
  });
>>>>>>> main
});
