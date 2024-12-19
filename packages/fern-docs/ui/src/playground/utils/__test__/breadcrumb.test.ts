import identity from "@fern-api/ui-core-utils/identity";
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
            ])
        ).toStrictEqual(["a", "b"]);
        expect(arraylcd([["a", "b", "c"]])).toStrictEqual(["a", "b", "c"]);
        expect(arraylcd([["a"], ["a"]])).toStrictEqual(["a"]);
        expect(arraylcd([["a", "b"], ["b"]])).toStrictEqual([]);
        expect(
            arraylcd([
                ["a", "b", "c", "d"],
                ["a", "b", "c"],
                ["a", "b", "c", "d", "e"],
            ])
        ).toStrictEqual(["a", "b", "c"]);
    });

    it("trims the lowest common breadcrumb", () => {
        expect(
            trimBreadcrumb([
                ["a", "b"],
                ["a", "b", "c"],
                ["a", "b", "d"],
                ["a", "b", "d", "f"],
            ])
        ).toStrictEqual([[], ["c"], ["d"], ["d", "f"]]);
    });

    it("avoids over-trimming if a descendent has a shorter breadcrumb", () => {
        expect(
            trimBreadcrumb([
                ["a", "b", "c"],
                ["a", "b", "c", "d"],
                ["a", "b", "c", "e"],
                ["a", "f"],
            ])
        ).toStrictEqual([["b", "c"], ["b", "c", "d"], ["b", "c", "e"], ["f"]]);
    });

    it("avoids trimming if theres a mix of breadcrumbs", () => {
        expect(
            trimBreadcrumb([
                ["a", "b", "c"],
                ["a", "b", "c", "d"],
                ["b", "f", "g"],
            ])
        ).toStrictEqual([
            ["a", "b", "c"],
            ["a", "b", "c", "d"],
            ["b", "f", "g"],
        ]);
    });

    it("avoids trimming if nodes are reversed", () => {
        expect(
            trimBreadcrumb([
                ["a", "b"], // since this is first, it's treated as the "root" node
                ["a", "b", "c"],
                ["a", "b", "c", "d"],
            ])
        ).toStrictEqual([[], ["c"], ["c", "d"]]);
        expect(
            trimBreadcrumb([
                ["a", "b", "c"],
                ["a", "b", "c", "d"],
                ["a", "b"], // typically this goes first, but since it's not first, don't trim away "b".
            ])
        ).toStrictEqual([["b", "c"], ["b", "c", "d"], ["b"]]);
    });

    it("successfully trims syndicate breadcrumbs", () => {
        expect(
            trimBreadcrumb([
                ["API", "Admin", "Projects"],
                ["API", "Admin", "Contracts & Function Signatures"],
                ["API", "Signatures"],
                ["API", "Wallets"],
            ])
        ).toStrictEqual([
            ["Admin", "Projects"],
            ["Admin", "Contracts & Function Signatures"],
            ["Signatures"],
            ["Wallets"],
        ]);
    });
});
