import { FernNavigation } from "@fern-api/fdr-sdk";
import { getToHref } from "../useHref";

const toHrefWithLeadingSlash = getToHref(true);
const toHrefWithoutLeadingSlash = getToHref(false);

describe("toHref", () => {
    it("should return href without leading slash", () => {
        expect(toHrefWithoutLeadingSlash(FernNavigation.Slug("slug"))).toBe(
            "/slug"
        );
        expect(toHrefWithoutLeadingSlash(FernNavigation.Slug("a/b/c"))).toBe(
            "/a/b/c"
        );
        expect(toHrefWithoutLeadingSlash(FernNavigation.Slug(""))).toBe("/");
        expect(
            toHrefWithoutLeadingSlash(FernNavigation.Slug("a/b"), "example.com")
        ).toBe("https://example.com/a/b");
        expect(
            toHrefWithoutLeadingSlash(FernNavigation.Slug(""), "example.com")
        ).toBe(
            "https://example.com/" // trailing slash on root is not removed
        );
    });

    it("should return href with leading slash", () => {
        expect(toHrefWithLeadingSlash(FernNavigation.Slug("slug"))).toBe(
            "/slug/"
        );
        expect(toHrefWithLeadingSlash(FernNavigation.Slug("a/b/c"))).toBe(
            "/a/b/c/"
        );
        expect(toHrefWithLeadingSlash(FernNavigation.Slug(""))).toBe("/");
        expect(
            toHrefWithLeadingSlash(FernNavigation.Slug("a/b"), "example.com")
        ).toBe("https://example.com/a/b/");
        expect(
            toHrefWithLeadingSlash(FernNavigation.Slug(""), "example.com")
        ).toBe(
            "https://example.com/" // trailing slash on root is not removed
        );
    });
});
