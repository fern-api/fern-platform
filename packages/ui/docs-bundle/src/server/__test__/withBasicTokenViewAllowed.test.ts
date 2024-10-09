import { NodeId, PageId, Slug, Url } from "@fern-api/fdr-sdk/navigation";
import { withBasicTokenAnonymous, withBasicTokenAnonymousCheck } from "../withBasicTokenAnonymous";

describe("withBasicTokenAnonymous", () => {
    it("should deny the request if the allowlist is empty", () => {
        expect(withBasicTokenAnonymous({}, "/public")).toBe(false);
        expect(withBasicTokenAnonymous({ allowlist: [] }, "/public")).toBe(false);
    });

    it("should allow the request to pass through if the path is in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public"] }, "/public")).toBe(true);
    });

    it("should allow the request to pass through if the path matches a regex in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public/(.*)"] }, "/public/123")).toBe(true);
    });

    it("should allow the request to pass through if the path matches a path expression in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public/:id"] }, "/public/123")).toBe(true);
    });

    it("should not allow the request to pass through if the path is not in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public", "/public/:id"] }, "/private")).toBe(false);
        expect(withBasicTokenAnonymous({ allowlist: ["/public", "/public/:id"] }, "/private/123")).toBe(false);
    });

    it("shouuld respect denylist before allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public"], denylist: ["/public"] }, "/public")).toBe(false);
    });

    it("should never deny external links", () => {
        expect(
            withBasicTokenAnonymousCheck({ denylist: ["/(.*)"] })({
                type: "link",
                url: Url("https://example.com"),
                title: "External url",
                icon: undefined,
                id: NodeId("1"),
            }),
        ).toBe(true);
    });

    it("should prune childless non-leaf nodes", () => {
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
                overviewPageId: undefined,
                noindex: undefined,
                pointsTo: undefined,
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
                overviewPageId: PageId("1.mdx"),
                noindex: undefined,
                pointsTo: undefined,
            }),
        ).toBe(true);
    });
});
