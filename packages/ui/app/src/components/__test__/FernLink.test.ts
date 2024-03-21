import { checkIsExternalUrl, checkIsRelativeUrl, formatUrlString, resolveRelativeUrl, toUrlObject } from "../FernLink";

describe("checkIsExternalUrl", () => {
    it("returns true for external URLs", () => {
        expect(checkIsExternalUrl(toUrlObject("https://example.com"))).toBe(true);
        expect(checkIsExternalUrl(toUrlObject("http://example.com"))).toBe(true);
        expect(checkIsExternalUrl(toUrlObject("mailto:hello@example.com"))).toBe(true);
        expect(checkIsExternalUrl(toUrlObject("tel:1234567890"))).toBe(true);
    });

    it("returns false for relative URLs", () => {
        expect(checkIsExternalUrl(toUrlObject("/path"))).toBe(false);
        expect(checkIsExternalUrl(toUrlObject("path"))).toBe(false);
        expect(checkIsExternalUrl(toUrlObject("../path"))).toBe(false);
        expect(checkIsExternalUrl(toUrlObject("./path"))).toBe(false);
    });
});

describe("checkIsRelativeUrl", () => {
    it("returns true for relative URLs", () => {
        expect(checkIsRelativeUrl(toUrlObject("/path"))).toBe(true);
        expect(checkIsRelativeUrl(toUrlObject("path"))).toBe(true);
        expect(checkIsRelativeUrl(toUrlObject("../path"))).toBe(true);
        expect(checkIsRelativeUrl(toUrlObject("./path"))).toBe(true);
    });

    it("returns false for external URLs", () => {
        expect(checkIsRelativeUrl(toUrlObject("https://example.com"))).toBe(false);
        expect(checkIsRelativeUrl(toUrlObject("http://example.com"))).toBe(false);
        expect(checkIsRelativeUrl(toUrlObject("mailto:hello@example.com"))).toBe(false);
        expect(checkIsRelativeUrl(toUrlObject("tel:1234567890"))).toBe(false);
    });
});

describe("toUrlObject", () => {
    it("retains #hash and ?search", () => {
        expect(formatUrlString(toUrlObject("/path#hash"))).toEqual("/path#hash");
        expect(formatUrlString(toUrlObject("/path?search"))).toEqual("/path?search");
    });
});

describe("resolveRelativeUrl", () => {
    it("keeps urls that start with /", () => {
        expect(resolveRelativeUrl("/path", "/path")).toEqual("/path");
        expect(resolveRelativeUrl("/path/a/b/c", "/mypath")).toEqual("/mypath");
    });

    it("resolves relative urls", () => {
        expect(resolveRelativeUrl("/base/path", "a/b/c")).toEqual("/base/path/a/b/c");
        expect(resolveRelativeUrl("/base/path", "../a/b/c")).toEqual("/base/a/b/c");
        expect(resolveRelativeUrl("/base/path", "./a/b/c")).toEqual("/base/path/a/b/c");
    });

    it("retains #hash and ?search", () => {
        expect(resolveRelativeUrl("/base/path", "/path#hash")).toEqual("/path#hash");
        expect(resolveRelativeUrl("/base/path", "/path?search")).toEqual("/path?search");
        expect(resolveRelativeUrl("/base/path", "../path2#hash")).toEqual("/base/path2#hash");
        expect(resolveRelativeUrl("/base/path", "../../path2?search")).toEqual("/path2?search");
    });
});
