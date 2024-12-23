import { isFileWithData } from "../isFileWithData";

describe("isFileWithData", () => {
  it("should return true if input has filename and data properties as strings", () => {
    const input = { filename: "test.txt", data: "test data" };
    expect(isFileWithData(input)).toBe(true);
  });

  it("should return false if input is null", () => {
    expect(isFileWithData(null)).toBe(false);
  });

  it("should return false if input is undefined", () => {
    expect(isFileWithData(undefined)).toBe(false);
  });

  it("should return false if input is not an object", () => {
    expect(isFileWithData("not an object")).toBe(false);
  });

  it("should return false if input does not have filename property", () => {
    const input = { data: "test data" };
    expect(isFileWithData(input)).toBe(false);
  });

  it("should return false if input does not have data property", () => {
    const input = { filename: "test.txt" };
    expect(isFileWithData(input)).toBe(false);
  });

  it("should return false if filename property is not a string", () => {
    const input = { filename: 123, data: "test data" };
    expect(isFileWithData(input)).toBe(false);
  });

  it("should return false if data property is not a string", () => {
    const input = { filename: "test.txt", data: 123 };
    expect(isFileWithData(input)).toBe(false);
  });
});
