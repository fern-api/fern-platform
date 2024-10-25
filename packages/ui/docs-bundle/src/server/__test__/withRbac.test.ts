import { NodeId, PageId, RoleId, Slug, Url } from "@fern-api/fdr-sdk/navigation";
import { Gate, getViewerFilters, matchRoles, withBasicTokenAnonymous, withBasicTokenAnonymousCheck } from "../withRbac";

describe("withBasicTokenAnonymous", () => {
    it("should allow the request if no rules are provided", () => {
        expect(withBasicTokenAnonymous({}, "/public")).toBe(Gate.ALLOW);
    });

    it("should deny the request if the allowlist is empty", () => {
        expect(withBasicTokenAnonymous({ allowlist: [] }, "/public")).toBe(Gate.DENY);
    });

    it("should allow the request to pass through if the path is in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public"] }, "/public")).toBe(Gate.ALLOW);
    });

    it("should allow the request to pass through if the path matches a regex in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public/(.*)"] }, "/public/123")).toBe(Gate.ALLOW);
    });

    it("should allow the request to pass through if the path matches a path expression in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public/:id"] }, "/public/123")).toBe(Gate.ALLOW);
    });

    it("should not allow the request to pass through if the path is not in the allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public", "/public/:id"] }, "/private")).toBe(Gate.DENY);
        expect(withBasicTokenAnonymous({ allowlist: ["/public", "/public/:id"] }, "/private/123")).toBe(Gate.DENY);
    });

    it("shouuld respect denylist before allowlist", () => {
        expect(withBasicTokenAnonymous({ allowlist: ["/public"], denylist: ["/public"] }, "/public")).toBe(Gate.DENY);
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
        ).toBe(Gate.ALLOW);
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
                viewers: undefined,
                orphaned: undefined,
            }),
        ).toBe(Gate.ALLOW);
    });
});

describe("matchRoles", () => {
    it("should return true if the audience is empty", () => {
        expect(matchRoles(true, [], [])).toBe(Gate.ALLOW);
        expect(matchRoles(true, [], [[], []])).toBe(Gate.ALLOW);
    });

    it("should return false if an audience filter exists", () => {
        expect(matchRoles(true, [], [["a"]])).toBe(Gate.DENY);
    });

    it("should return true if the role is everyone", () => {
        expect(matchRoles(true, [], [["everyone"]])).toBe(Gate.ALLOW);
    });

    it("should return true if the audience matches the filter", () => {
        expect(matchRoles(true, ["a"], [["a"]])).toBe(Gate.ALLOW);
    });

    it("should return true if the audience matches any of the filters", () => {
        expect(matchRoles(true, ["a"], [["b", "a"]])).toBe(Gate.ALLOW);
    });

    it("should return false if the audience does not match any of the filters", () => {
        expect(matchRoles(true, ["a"], [["b"]])).toBe(Gate.DENY);
    });

    it("should return false if the audience does not match all filters across all nodes", () => {
        expect(matchRoles(true, ["a"], [["a"], ["b"]])).toBe(Gate.DENY);
        expect(matchRoles(true, ["b"], [["a"], ["a", "b"]])).toBe(Gate.DENY);
    });

    it("should return true if the audience matches all filters across all nodes", () => {
        expect(matchRoles(true, ["a"], [["a"], ["a"]])).toBe(Gate.ALLOW);
        expect(matchRoles(true, ["a"], [["a"], ["a", "b"]])).toBe(Gate.ALLOW);
        expect(matchRoles(true, ["a", "b"], [["a"], ["a", "b"]])).toBe(Gate.ALLOW);
        expect(matchRoles(true, ["a", "b"], [["a"], ["b"]])).toBe(Gate.ALLOW);
    });

    it("should return true if the user has more audiences than the filter", () => {
        expect(matchRoles(true, ["a", "b"], [])).toBe(Gate.ALLOW);
        expect(matchRoles(true, ["a", "b"], [[]])).toBe(Gate.ALLOW);
        expect(matchRoles(true, ["a", "b"], [["a"]])).toBe(Gate.ALLOW);
    });
});

describe("getViewerFilters", () => {
    it("should return an empty array if there are no viewer filters", () => {
        expect(getViewerFilters()).toEqual([]);
    });

    it("should return the viewer filters for the given nodes", () => {
        expect(
            getViewerFilters(
                { viewers: [RoleId("a")], orphaned: undefined },
                { viewers: [], orphaned: undefined },
                { viewers: [RoleId("b")], orphaned: undefined },
            ),
        ).toEqual([["a"], ["b"]]);
    });

    it("should ignore permissions of parents of the parents of an orphaned node", () => {
        expect(
            getViewerFilters(
                { viewers: [RoleId("a")], orphaned: undefined },
                { viewers: [RoleId("b")], orphaned: undefined },
                { viewers: [RoleId("c")], orphaned: true },
            ),
        ).toEqual([["c"]]);
    });

    it("should return the viewer filters for the given nodes, ignoring permissions of parents of the parents of an orphaned node", () => {
        expect(
            getViewerFilters(
                { viewers: [RoleId("a")], orphaned: undefined },
                { viewers: [RoleId("b")], orphaned: undefined },
                { viewers: [RoleId("c")], orphaned: true },
                { viewers: [RoleId("d")], orphaned: undefined },
            ),
        ).toEqual([["c"], ["d"]]);
    });

    it("should pick the last orphaned node's viewers", () => {
        expect(
            getViewerFilters(
                { viewers: [RoleId("a")], orphaned: undefined },
                { viewers: [RoleId("b")], orphaned: true },
                { viewers: [RoleId("c")], orphaned: undefined },
                { viewers: [RoleId("d")], orphaned: undefined },
                { viewers: [RoleId("e")], orphaned: true },
            ),
        ).toEqual([["e"]]);
    });
});
