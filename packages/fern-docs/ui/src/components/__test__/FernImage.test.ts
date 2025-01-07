import { getDimensions } from "../FernImage";

describe("getDimensions", () => {
  it("should return the intrinsic dimensions if no maxWidth or maxHeight is provided", () => {
    const dimensions = getDimensions({
      intrinsicWidth: 100,
      intrinsicHeight: 100,
    });

    expect(dimensions).toEqual({ width: 100, height: 100 });
  });

  it("should use the user-provided width and height, even if they are larger than the intrinsic dimensions or has a different aspect ratio", () => {
    const dimensions = getDimensions({
      intrinsicWidth: 100,
      intrinsicHeight: 100,
      width: 200,
      height: 250,
    });

    expect(dimensions).toEqual({ width: 200, height: 250 });
  });

  it("should use the user-provided width, and scale the height to maintain the aspect ratio", () => {
    const dimensions = getDimensions({
      intrinsicWidth: 100,
      intrinsicHeight: 150,
      width: 200,
    });

    expect(dimensions).toEqual({ width: 200, height: 300 });
  });

  it("should use the user-provided height, and scale the width to maintain the aspect ratio and ignore provided maxWidth", () => {
    const dimensions = getDimensions({
      intrinsicWidth: 100,
      intrinsicHeight: 160,
      height: 200,
    });

    expect(dimensions).toEqual({ width: 125, height: 200 });
  });
});
