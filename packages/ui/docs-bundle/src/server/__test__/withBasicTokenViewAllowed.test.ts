import { NodeId, PageId, Slug, Url } from "@fern-api/fdr-sdk/navigation";
import { matchAudience, withBasicTokenAnonymous, withBasicTokenAnonymousCheck } from "../withBasicTokenAnonymous";

describe("withBasicTokenAnonymous", () => {
    it("should deny the request if the allowlist is empty", () => {
        expect(withBasicTokenAnonymous({}, "/public")).toBe(true);
        expect(withBasicTokenAnonymous({ allowlist: [] }, "/public")).toBe(true);
    });

    it("should allow the request to pass through if the path is in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public"] }, "/public")).toBe(false);
    });

    it("should allow the request to pass through if the path matches a regex in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public/(.*)"] }, "/public/123")).toBe(false);
    });

    it("should allow the request to pass through if the path matches a path expression in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public/:id"] }, "/public/123")).toBe(false);
    });

    it("should not allow the request to pass through if the path is not in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public", "/public/:id"] }, "/private")).toBe(true);
        expect(withBasicTokenAnonymous({ allowlist: ["/public", "/public/:id"] }, "/private/123")).toBe(true);
    });

    it("shouuld respect denylist before allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public"], denylist: ["/public"] }, "/public")).toBe(true);
    });
});

describe("withBasicTokenAnonymousCheck", () => {
    it("should never deny external links", () => {
        expect(
            withBasicTokenAnonymousCheck({ denylist: ["/(.*)"] })({
                type: "link",
                url: Url("https://example.com"),
                title: "External url",
                icon: undefined,
                id: NodeId("1"),
            }),
        ).toBe(false);
    });

    it("should ignore childless non-leaf nodes", () => {
        expect(
            withBasicTokenAnonymousCheck({ allowlist: ["/public"] })({
                type: "section",
                title: "Public",
                children: [],
                id: NodeId("1"),
                slug: Slug("public"),
                collapsed: false,
                canonicalSlug: undefined,
                icon: undefined,
                hidden: undefined,
                authed: undefined,
                overviewPageId: undefined,
                noindex: undefined,
                pointsTo: undefined,
                audience: undefined,
            }),
        ).toBe(false);
    });

    it("should not prune childless non-leaf nodes that have content", () => {
        expect(
            withBasicTokenAnonymousCheck({ allowlist: ["/public"] })({
                type: "section",
                title: "Public",
                children: [],
                id: NodeId("1"),
                slug: Slug("public"),
                collapsed: false,
                canonicalSlug: undefined,
                icon: undefined,
                hidden: undefined,
                authed: undefined,
                overviewPageId: PageId("1.mdx"),
                noindex: undefined,
                pointsTo: undefined,
                audience: undefined,
            }),
        ).toBe(false);
    });
});

describe("matchAudience", () => {
    it("should return true if the audience is empty", () => {
        expect(matchAudience([], [])).toBe(true);
        expect(matchAudience([], [[], []])).toBe(true);
    });

    it("should return false if an audience filter exists", () => {
        expect(matchAudience([], [["a"]])).toBe(false);
    });

    it("should return true if the audience matches the filter", () => {
        expect(matchAudience(["a"], [["a"]])).toBe(true);
    });

    it("should return true if the audience matches any of the filters", () => {
        expect(matchAudience(["a"], [["b", "a"]])).toBe(true);
    });

    it("should return false if the audience does not match any of the filters", () => {
        expect(matchAudience(["a"], [["b"]])).toBe(false);
    });

    it("should return false if the audience does not match all filters across all nodes", () => {
        expect(matchAudience(["a"], [["a"], ["b"]])).toBe(false);
        expect(matchAudience(["b"], [["a"], ["a", "b"]])).toBe(false);
    });

    it("should return true if the audience matches all filters across all nodes", () => {
        expect(matchAudience(["a"], [["a"], ["a"]])).toBe(true);
        expect(matchAudience(["a"], [["a"], ["a", "b"]])).toBe(true);
        expect(matchAudience(["a", "b"], [["a"], ["a", "b"]])).toBe(true);
        expect(matchAudience(["a", "b"], [["a"], ["b"]])).toBe(true);
    });

    it("should return true if the user has more audiences than the filter", () => {
        expect(matchAudience(["a", "b"], [])).toBe(true);
        expect(matchAudience(["a", "b"], [[]])).toBe(true);
        expect(matchAudience(["a", "b"], [["a"]])).toBe(true);
    });
});
