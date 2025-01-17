import { extractAnchorFromHeadingText } from "../custom-headings";

describe("custom-headings", () => {
  it("should extract the anchor from the heading text", () => {
    const { text, anchor } = extractAnchorFromHeadingText(
      "My Heading [#some-anchor]"
    );
    expect(text).toBe("My Heading");
    expect(anchor).toBe("some-anchor");
  });

  it("should extract the anchor from the heading text with a prefix", () => {
    const { text, anchor } = extractAnchorFromHeadingText(
      "My Heading {#some-anchor}"
    );
    expect(text).toBe("My Heading");
    expect(anchor).toBe("some-anchor");
  });

  it("should handle anchors with periods", () => {
    const { text, anchor } = extractAnchorFromHeadingText(
      "My Heading {#some-anchor.with.periods}"
    );
    expect(text).toBe("My Heading");
    expect(anchor).toBe("some-anchor.with.periods");
  });

  it("should handle a variety of valid characters", () => {
    const { text, anchor } = extractAnchorFromHeadingText(
      "My Heading {#some.anchor_with-dashes:andcolons123}"
    );
    expect(text).toBe("My Heading");
    expect(anchor).toBe("some.anchor_with-dashes:andcolons123");
  });

  it("should ignore the anchor if it's not valid", () => {
    const { text, anchor } = extractAnchorFromHeadingText(
      "My Heading [#invalidanchor}"
    );
    expect(text).toBe("My Heading [#invalidanchor}");
    expect(anchor).toBeUndefined();
  });
});
