import { isExampleCodeSampleSchemaSdk } from "../isExampleCodeSampleSchemaSdk";

describe("isExampleCodeSampleSchemaSdk", () => {
<<<<<<< HEAD
    it("should return true if input has sdk property", () => {
        const input = { sdk: "typescript" };
        expect(isExampleCodeSampleSchemaSdk(input)).toBe(true);
    });

    it("should return false if input is null", () => {
        expect(isExampleCodeSampleSchemaSdk(null)).toBe(false);
    });

    it("should return false if input is undefined", () => {
        expect(isExampleCodeSampleSchemaSdk(undefined)).toBe(false);
    });

    it("should return false if input is not an object", () => {
        expect(isExampleCodeSampleSchemaSdk("not an object")).toBe(false);
    });

    it("should return false if input does not have sdk property", () => {
        const input = { notSdk: "typescript" };
        expect(isExampleCodeSampleSchemaSdk(input)).toBe(false);
    });
=======
  it("should return true if input has sdk property", () => {
    const input = { sdk: "typescript" };
    expect(isExampleCodeSampleSchemaSdk(input)).toBe(true);
  });

  it("should return false if input is null", () => {
    expect(isExampleCodeSampleSchemaSdk(null)).toBe(false);
  });

  it("should return false if input is undefined", () => {
    expect(isExampleCodeSampleSchemaSdk(undefined)).toBe(false);
  });

  it("should return false if input is not an object", () => {
    expect(isExampleCodeSampleSchemaSdk("not an object")).toBe(false);
  });

  it("should return false if input does not have sdk property", () => {
    const input = { notSdk: "typescript" };
    expect(isExampleCodeSampleSchemaSdk(input)).toBe(false);
  });
>>>>>>> main
});
