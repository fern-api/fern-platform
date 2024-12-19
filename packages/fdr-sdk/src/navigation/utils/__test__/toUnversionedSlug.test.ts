import { Slug } from "../..";
import { toUnversionedSlug } from "../toUnversionedSlug";

describe("toUnversionedSlug", () => {
  it("should trim version slug from the beginning of the slug", () => {
    expect(
      toUnversionedSlug(Slug("docs/v1.0.0/foo/bar"), Slug("docs/v1.0.0"))
    ).toBe("foo/bar");
  });

  it("should not trim version slug if it does not match", () => {
    expect(
      toUnversionedSlug(Slug("docs/v1.0.0/foo/bar"), Slug("docs/v2.0.0"))
    ).toBe("docs/v1.0.0/foo/bar");
  });

  it("should not trim version slug if it does not match exactly", () => {
    expect(
      toUnversionedSlug(Slug("docs/v1.0.0/foo/bar"), Slug("docs/v1.0"))
    ).toBe("docs/v1.0.0/foo/bar");
  });

  it("should return empty string if the slug is the same as the version slug", () => {
    expect(toUnversionedSlug(Slug("docs/v1.0.0"), Slug("docs/v1.0.0"))).toBe(
      ""
    );
  });
});
