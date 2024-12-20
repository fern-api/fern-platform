import { isExampleCodeSampleSchemaLanguage } from "../isExampleCodeSampleSchemaLanguage";

describe("isExampleCodeSampleSchemaLanguage", () => {
  it("should return true if input has language property", () => {
    const input = { language: "typescript" };
    expect(isExampleCodeSampleSchemaLanguage(input)).toBe(true);
  });

  it("should return false if input is null", () => {
    expect(isExampleCodeSampleSchemaLanguage(null)).toBe(false);
  });

  it("should return false if input is undefined", () => {
    expect(isExampleCodeSampleSchemaLanguage(undefined)).toBe(false);
  });

  it("should return false if input is not an object", () => {
    expect(isExampleCodeSampleSchemaLanguage("not an object")).toBe(false);
  });

  it("should return false if input does not have language property", () => {
    const input = { notLanguage: "typescript" };
    expect(isExampleCodeSampleSchemaLanguage(input)).toBe(false);
  });
});
