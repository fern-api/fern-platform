import { toPixelValue } from "../to-pixel-value";

describe("toPixelValue", () => {
  it("should return number if the value is a number", () => {
    expect(toPixelValue(10)).toEqual(10);
  });

  it("should return undefined if the value is not a string", () => {
    expect(toPixelValue(undefined)).toEqual(undefined);
  });

  it("should strip units from a string", () => {
    expect(toPixelValue("10px")).toEqual(10);
  });

  it("should handle rem units", () => {
    expect(toPixelValue("1rem")).toEqual(16);
  });

  it("should handle decimal rem units", () => {
    expect(toPixelValue("1.5rem")).toEqual(24);
  });

  it("should handle negative pixel values", () => {
    expect(toPixelValue("-10px")).toEqual(undefined);
    expect(toPixelValue("-1rem")).toEqual(undefined);
    expect(toPixelValue("-1.5rem")).toEqual(undefined);
  });

  it("should return undefined if the value is not a valid pixel value", () => {
    expect(toPixelValue("10em")).toEqual(undefined);
  });

  it("should return undefined if the value is not a valid rem value", () => {
    expect(toPixelValue("1d0rem")).toEqual(undefined);
  });

  it("should handle em units", () => {
    expect(toPixelValue("10em")).toEqual(undefined);
  });

  it("should handle vh units", () => {
    expect(toPixelValue("10vh")).toEqual(undefined);
  });

  it("should handle vw units", () => {
    expect(toPixelValue("10vw")).toEqual(undefined);
  });

  it("should handle percentage values", () => {
    expect(toPixelValue("50%")).toEqual(undefined);
  });

  it("should handle cm units", () => {
    expect(toPixelValue("10cm")).toEqual(undefined);
  });

  it("should handle mm units", () => {
    expect(toPixelValue("10mm")).toEqual(undefined);
  });

  it("should handle in units", () => {
    expect(toPixelValue("10in")).toEqual(undefined);
  });

  it("should handle pt units", () => {
    expect(toPixelValue("10pt")).toEqual(undefined);
  });

  it("should handle pc units", () => {
    expect(toPixelValue("10pc")).toEqual(undefined);
  });
});
