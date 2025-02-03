import {
  checkIsExternalUrl,
  checkIsRelativeUrl,
  formatUrlString,
  resolveRelativeUrl,
  toUrlObject,
} from "../../../components/link";

describe("checkIsExternalUrl", () => {
  it("returns true for external URLs", () => {
    expect(checkIsExternalUrl(toUrlObject("https://example.com"))).toBe(true);
    expect(checkIsExternalUrl(toUrlObject("http://example.com"))).toBe(true);
    expect(checkIsExternalUrl(toUrlObject("mailto:hello@example.com"))).toBe(
      true
    );
    expect(checkIsExternalUrl(toUrlObject("tel:1234567890"))).toBe(true);
  });

  it("returns false for relative and absolute URLs", () => {
    expect(checkIsExternalUrl(toUrlObject("/path"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("/path/to/docs"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("path"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("path/to/docs"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("../path"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("../../path"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("./path"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("#hash"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("#"))).toBe(false);
    expect(checkIsExternalUrl(toUrlObject("?search"))).toBe(false);
    expect(checkIsExternalUrl({})).toBe(false);
  });
});

describe("checkIsRelativeUrl", () => {
  it("returns true for relative URLs", () => {
    expect(checkIsRelativeUrl(toUrlObject("path"))).toBe(true);
    expect(checkIsRelativeUrl(toUrlObject("path/to/docs"))).toBe(true);
    expect(checkIsRelativeUrl(toUrlObject("../path"))).toBe(true);
    expect(checkIsRelativeUrl(toUrlObject("../../path"))).toBe(true);
    expect(checkIsRelativeUrl(toUrlObject("./path"))).toBe(true);
    expect(checkIsRelativeUrl({})).toBe(true);
    expect(checkIsRelativeUrl(toUrlObject("#hash"))).toBe(true);
    expect(checkIsRelativeUrl(toUrlObject("#"))).toBe(true);
    expect(checkIsRelativeUrl(toUrlObject("?search"))).toBe(true);
  });

  it("returns false for absolute URLs", () => {
    expect(checkIsRelativeUrl(toUrlObject("/path"))).toBe(false);
    expect(checkIsRelativeUrl(toUrlObject("/#"))).toBe(false);
  });

  it("returns false for external URLs", () => {
    expect(checkIsRelativeUrl(toUrlObject("https://example.com"))).toBe(false);
    expect(checkIsRelativeUrl(toUrlObject("http://example.com"))).toBe(false);
    expect(checkIsRelativeUrl(toUrlObject("mailto:hello@example.com"))).toBe(
      false
    );
    expect(checkIsRelativeUrl(toUrlObject("tel:1234567890"))).toBe(false);
  });
});

describe("toUrlObject", () => {
  it("retains #hash and ?search", () => {
    expect(formatUrlString(toUrlObject("/path#hash"))).toEqual("/path#hash");
    expect(formatUrlString(toUrlObject("/path?search"))).toEqual(
      "/path?search"
    );
  });
});

describe("resolveRelativeUrl", () => {
  it("keeps urls that start with /", () => {
    expect(resolveRelativeUrl("/path", "/path")).toEqual("/path");
    expect(resolveRelativeUrl("/path/a/b/c", "/mypath")).toEqual("/mypath");
  });

  it("resolves relative urls", () => {
    expect(resolveRelativeUrl("/base/path", "a/b/c")).toEqual("/base/a/b/c");
    expect(resolveRelativeUrl("/base/path", "../a/b/c")).toEqual("/a/b/c");
    expect(resolveRelativeUrl("/base/path", "./a/b/c")).toEqual("/base/a/b/c");
  });

  it("retains #hash and ?search", () => {
    expect(resolveRelativeUrl("/base/path", "/path#hash")).toEqual(
      "/path#hash"
    );
    expect(resolveRelativeUrl("/base/path", "/path?search")).toEqual(
      "/path?search"
    );
    expect(resolveRelativeUrl("/base/path", "../path2#hash")).toEqual(
      "/path2#hash"
    );
    expect(resolveRelativeUrl("/base/path", "../../path2?search")).toEqual(
      "/path2?search"
    );
    expect(resolveRelativeUrl("/base/path", "#hash")).toEqual(
      "/base/path#hash"
    );
    expect(resolveRelativeUrl("/base/path", "#")).toEqual("/base/path#");
    expect(resolveRelativeUrl("/base/path", "?")).toEqual("/base/path?");
    expect(resolveRelativeUrl("/base/path", formatUrlString({}))).toEqual(
      "/base/path"
    );
  });

  it("drops #hash from the left side", () => {
    expect(resolveRelativeUrl("/base/path#hash", "#hash2")).toEqual(
      "/base/path#hash2"
    );
    expect(resolveRelativeUrl("/base/path#hash", "#")).toEqual("/base/path#");
    expect(resolveRelativeUrl("/base/path#hash", "?search")).toEqual(
      "/base/path?search"
    );
    expect(resolveRelativeUrl("/base/path#hash", "?")).toEqual("/base/path?");
    expect(resolveRelativeUrl("/base/path#hash", formatUrlString({}))).toEqual(
      "/base/path"
    );
    expect(resolveRelativeUrl("/base/path#hash", "/path")).toEqual("/path");
    expect(resolveRelativeUrl("/base/path#hash", "path2")).toEqual(
      "/base/path2"
    );
  });
});
