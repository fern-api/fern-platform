import { slugjoin } from "../slugjoin";

describe("slugjoin", () => {
    it("should join slugs", () => {
        expect(slugjoin("a", "b", "c")).toBe("a/b/c");
        expect(slugjoin("a", "b", "c/")).toBe("a/b/c");
        expect(slugjoin("a", "b", "/c")).toBe("a/b/c");
        expect(slugjoin("/a", "//b", "/c/d/e")).toBe("a/b/c/d/e");
        expect(slugjoin("a", "b", "c", "d")).toBe("a/b/c/d");
        expect(slugjoin("a  ", " b", "c/ ", "", " / d", "e ")).toBe("a/b/c/ d/e");
        expect(slugjoin("a", " ", " ", " / / ", "e")).toBe("a/ /e");
    });

    it("should join slugs from messy params", () => {
        expect(slugjoin()).toBe("");
        expect(slugjoin(undefined)).toBe("");
        expect(slugjoin(null)).toBe("");
        expect(slugjoin(null, null, "a")).toBe("a");
        expect(slugjoin("a")).toBe("a");
        expect(slugjoin(["a", "b"])).toBe("a/b");
        expect(slugjoin(undefined, ["a", "b"], null, ["c"], "d")).toBe("a/b/c/d");
    });
});
