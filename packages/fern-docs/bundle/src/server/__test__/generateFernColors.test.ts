import * as RadixColors from "@radix-ui/colors";

import {
  FERN_COLOR_ACCENT,
  FERN_COLOR_AIR,
  FERN_COLOR_GROUND,
} from "@fern-docs/utils";

import {
  generateFernColorPalette,
  getClosestGrayColor,
  getSourceForGrayscale,
  isWhiteOrBlack,
} from "../generateFernColors";

vi.mock("server-only", () => ({}));

describe("isWhiteOrBlack", () => {
  it("should return true for white", () => {
    expect(isWhiteOrBlack("#fff")).toBe(true);
    expect(isWhiteOrBlack("#ffffff")).toBe(true);
    expect(isWhiteOrBlack("#000")).toBe(true);
    expect(isWhiteOrBlack("#000000")).toBe(true);
    expect(isWhiteOrBlack("rgb(255, 255, 255)")).toBe(true);
    expect(isWhiteOrBlack("rgb(0, 0, 0)")).toBe(true);
    expect(isWhiteOrBlack("rgba(255, 255, 255, 1)")).toBe(true);
    expect(isWhiteOrBlack("rgba(0, 0, 0, 1)")).toBe(true);
    expect(isWhiteOrBlack("#000000FF")).toBe(true);
    expect(isWhiteOrBlack("#FFFFFFFF")).toBe(true);
    expect(isWhiteOrBlack("rgba(0, 0, 0, 0.5)")).toBe(true);
    expect(isWhiteOrBlack("rgba(255, 255, 255, 0.5)")).toBe(true);
    expect(isWhiteOrBlack("white")).toBe(true);
    expect(isWhiteOrBlack("black")).toBe(true);
    expect(isWhiteOrBlack("hsl(0, 0%, 100%)")).toBe(true);
    expect(isWhiteOrBlack("hsl(0, 0%, 0%)")).toBe(true);
  });

  it("should return false for other colors", () => {
    expect(isWhiteOrBlack("#999")).toBe(false);
    expect(isWhiteOrBlack("#aaa")).toBe(false);
    expect(isWhiteOrBlack("#eee")).toBe(false);
    expect(isWhiteOrBlack("#f0f0f0")).toBe(false);
    expect(isWhiteOrBlack("#ff0000")).toBe(false);
    expect(isWhiteOrBlack("rgb(200, 230, 255)")).toBe(false);
    expect(isWhiteOrBlack("rgb(100, 100, 100)")).toBe(false);
    expect(isWhiteOrBlack("rgba(255, 250, 255, 0.5)")).toBe(false);
    expect(isWhiteOrBlack("rgba(0, 0, 1, 0.5)")).toBe(false);
    expect(isWhiteOrBlack("hsl(0, 0%, 50%)")).toBe(false);
    expect(isWhiteOrBlack("hsl(0, 0%, 50%)")).toBe(false);
  });
});

describe("getSourceForGrayscale", () => {
  it("should return gray when colors isnt specified", () => {
    expect(getSourceForGrayscale({})).toBe(RadixColors.gray.gray12);
  });

  it("should return background when only background is specified", () => {
    expect(getSourceForGrayscale({ background: "#fff" })).toBe("#fff");
    expect(getSourceForGrayscale({ background: "#000" })).toBe("#000");
    expect(getSourceForGrayscale({ background: "#f0f0f0" })).toBe("#f0f0f0");
  });

  it("should return background when bg is colored", () => {
    expect(
      getSourceForGrayscale({ background: "#ff0000", accent: "#123" })
    ).toBe("#ff0000");
    expect(
      getSourceForGrayscale({ background: "#eeeeee", accent: "#123" })
    ).toBe("#eeeeee");
  });

  it("should return accent when bg is white or black", () => {
    expect(getSourceForGrayscale({ background: "#fff", accent: "#123" })).toBe(
      "#123"
    );
    expect(getSourceForGrayscale({ background: "#000", accent: "#123" })).toBe(
      "#123"
    );
  });

  it("should return accent when bg is not specified", () => {
    expect(getSourceForGrayscale({ accent: "#123" })).toBe("#123");
  });
});

describe("getClosestGrayColor", () => {
  it("should pick a grayscale that matches closely with the source color", () => {
    expect(getClosestGrayColor("#FFFAEA")).toMatchInlineSnapshot(`"olive"`);
    expect(getClosestGrayColor("#61F6B5")).toMatchInlineSnapshot(`"olive"`);
    expect(getClosestGrayColor("#0E0E12")).toMatchInlineSnapshot(`"slate"`);
    expect(getClosestGrayColor("#FAFCFA")).toMatchInlineSnapshot(`"sage"`);
    expect(getClosestGrayColor("#1EA32A")).toMatchInlineSnapshot(`"olive"`);
  });
});

describe("generateFernColorPalette", () => {
  it("Should generate fern colors", () => {
    expect(
      generateFernColorPalette({
        appearance: "light",
        accent: FERN_COLOR_ACCENT,
        background: FERN_COLOR_AIR,
      })
    ).toMatchSnapshot();
    expect(
      generateFernColorPalette({
        appearance: "dark",
        accent: FERN_COLOR_ACCENT,
        background: FERN_COLOR_GROUND,
      })
    ).toMatchSnapshot();
  });

  it("should generate vapi colors", () => {
    expect(
      generateFernColorPalette({
        appearance: "light",
        accent: "#61F6B5",
        background: "#FFFAEA",
      })
    ).toMatchSnapshot();

    expect(
      generateFernColorPalette({
        appearance: "dark",
        background: "#0E0E12",
        accent: "#61F6B5",
      })
    ).toMatchSnapshot();
  });

  it("should generate humanloop colors", () => {
    expect(
      generateFernColorPalette({
        appearance: "light",
        background: "#FFF",
        accent: "#2A6A42",
      })
    ).toMatchSnapshot();

    expect(
      generateFernColorPalette({
        appearance: "dark",
        background: "#07110C",
        accent: "#2A6A42",
      })
    ).toMatchSnapshot();
  });
});
