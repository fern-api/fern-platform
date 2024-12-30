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
        expect(slugjoin()).toBe("");
    });
});
