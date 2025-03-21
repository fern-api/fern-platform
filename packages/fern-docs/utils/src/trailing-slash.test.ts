import { conformTrailingSlash } from "./trailing-slash";

describe("conformTrailingSlash", () => {
  it("should add trailing slash if string is empty", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "1";
    expect(conformTrailingSlash("")).toBe("/");
  });

  it("should not remove trailing slash if string is root", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "0";
    expect(conformTrailingSlash("/")).toBe("/");
  });

  it("should not remove trailing slash if the pathname is a url", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "0";
    expect(conformTrailingSlash("https://example.com/")).toBe(
      "https://example.com/"
    );
  });

  it("should add trailing slash to pathname", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "1";
    expect(conformTrailingSlash("/foo")).toBe("/foo/");
  });

  it("should remove trailing slash from pathname", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "0";
    expect(conformTrailingSlash("/foo/")).toBe("/foo");
  });

  it("should add trailing slash to pathname with query string", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "1";
    expect(conformTrailingSlash("/foo?bar=baz")).toBe("/foo/?bar=baz");
  });

  it("should remove trailing slash from pathname with query string", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "0";
    expect(conformTrailingSlash("/foo/?bar=baz")).toBe("/foo?bar=baz");
  });

  it("should add trailing slash to pathname with hash", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "1";
    expect(conformTrailingSlash("/foo#bar")).toBe("/foo/#bar");
  });

  it("should remove trailing slash from pathname with hash", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "0";
    expect(conformTrailingSlash("/foo/#bar")).toBe("/foo#bar");
  });

  it("should add trailing slash to pathname with query string and hash", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "1";
    expect(conformTrailingSlash("/foo?bar=baz#qux")).toBe("/foo/?bar=baz#qux");
  });

  it("should remove trailing slash from pathname with query string and hash", () => {
    process.env.NEXT_PUBLIC_TRAILING_SLASH = "0";
    expect(conformTrailingSlash("/foo/?bar=baz#qux")).toBe("/foo?bar=baz#qux");
  });
});
