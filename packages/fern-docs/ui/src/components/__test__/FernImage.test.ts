import { getDimensions } from "../FernImage";

describe("getDimensions", () => {
  it("should return the original dimensions if no maxWidth or maxHeight is provided", () => {
    const dimensions = getDimensions({
      originalWidth: 100,
      originalHeight: 100,
    });

    expect(dimensions).toEqual({ width: 100, height: 100 });
  });

  it("should return the original dimensions if maxWidth is less than the original width", () => {
    const dimensions = getDimensions({
      originalWidth: 100,
      originalHeight: 100,
      maxWidth: 50,
    });

    expect(dimensions).toEqual({ width: 50, height: 50 });
  });

  it("should return the original dimensions if maxHeight is less than the original height", () => {
    const dimensions = getDimensions({
      originalWidth: 100,
      originalHeight: 100,
      maxHeight: 50,
    });

    expect(dimensions).toEqual({ width: 50, height: 50 });
  });

  it("should return the smallest of the maxWidth and maxHeight", () => {
    const dimensions = getDimensions({
      originalWidth: 150,
      originalHeight: 100,
      maxWidth: 50,
      maxHeight: 25,
    });

    expect(dimensions).toEqual({ width: 37.5, height: 25 });
  });

  it("should use the user-provided width and height, even if they are larger than the original dimensions or has a different aspect ratio", () => {
    const dimensions = getDimensions({
      originalWidth: 100,
      originalHeight: 100,
      propWidth: 200,
      propHeight: 250,
    });

    expect(dimensions).toEqual({ width: 200, height: 250 });
  });

  it("should use the user-provided width, and scale the height to maintain the aspect ratio", () => {
    const dimensions = getDimensions({
      originalWidth: 100,
      originalHeight: 100,
      propWidth: 200,
    });

    expect(dimensions).toEqual({ width: 200, height: 200 });
  });

  it("should use the user-provided height, and scale the width to maintain the aspect ratio and ignore provided maxWidth", () => {
    const dimensions = getDimensions({
      originalWidth: 100,
      originalHeight: 100,
      propHeight: 200,
      maxWidth: 50,
    });

    expect(dimensions).toEqual({ width: 200, height: 200 });
  });
});
