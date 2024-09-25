import { identity } from "lodash-es";
import { arraylcd, createBreadcrumbSlicer } from "../breadcrumb";

const trimBreadcrumb = createBreadcrumbSlicer<string[]>({
    selectBreadcrumb: identity,
    updateBreadcrumb: (_, breadcrumb) => breadcrumb as string[],
});

describe("breadcrumb", () => {
    it("gets lowest common array", () => {
        expect(
            arraylcd([
                ["a", "b", "c"],
                ["a", "b", "d"],
            ]),
        ).toStrictEqual(["a", "b"]);
        expect(arraylcd([["a", "b", "c"]])).toStrictEqual(["a", "b", "c"]);
        expect(arraylcd([["a"], ["a"]])).toStrictEqual(["a"]);
        expect(arraylcd([["a", "b"], ["b"]])).toStrictEqual([]);
        expect(
            arraylcd([
                ["a", "b", "c", "d"],
                ["a", "b", "c"],
                ["a", "b", "c", "d", "e"],
            ]),
        ).toStrictEqual(["a", "b", "c"]);
    });

    it("trims the lowest common breadcrumb", () => {
        expect(
            trimBreadcrumb([
                ["a", "b"],
                ["a", "b", "c"],
                ["a", "b", "d"],
                ["a", "b", "d", "f"],
            ]),
        ).toStrictEqual([[], ["c"], ["d"], ["d", "f"]]);
    });

    it("avoids over-trimming if a descendent has a shorter breadcrumb", () => {
        expect(
            trimBreadcrumb([
                ["a", "b", "c"],
                ["a", "b", "c", "d"],
                ["a", "b", "c", "e"],
                ["a", "f"],
            ]),
        ).toStrictEqual([["b", "c"], ["b", "c", "d"], ["b", "c", "e"], ["f"]]);
    });

    it("avoids trimming if theres a mix of breadcrumbs", () => {
        expect(
            trimBreadcrumb([
                ["a", "b", "c"],
                ["a", "b", "c", "d"],
                ["b", "f", "g"],
            ]),
        ).toStrictEqual([
            ["a", "b", "c"],
            ["a", "b", "c", "d"],
            ["b", "f", "g"],
        ]);
    });
});
