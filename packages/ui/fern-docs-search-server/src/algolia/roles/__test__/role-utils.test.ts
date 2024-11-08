import { EVERYONE_ROLE } from "@fern-ui/fern-docs-utils";
import { createPermutations, flipAndOrToOrAnd, modifyRolesForEveryone } from "../role-utils";

describe("flipAndOrToOrAnd", () => {
    it("should return []", () => {
        expect(flipAndOrToOrAnd([], new Map())).toEqual([]);
    });

    it("should return [a]", () => {
        expect(flipAndOrToOrAnd([["a"]], new Map([["a", 0]]))).toEqual([["a"]]);
        expect(flipAndOrToOrAnd([["a", "a"]], new Map([["a", 0]]))).toEqual([["a"]]);
        expect(flipAndOrToOrAnd([["a"], ["a"], ["a"]], new Map([["a", 0]]))).toEqual([["a"]]);
    });

    it("should return [a&b]", () => {
        expect(
            flipAndOrToOrAnd(
                [["a"], ["b"]],
                new Map([
                    ["a", 0],
                    ["b", 1],
                ]),
            ),
        ).toEqual([["a", "b"]]);
    });

    it("should return [a&e, a&f]", () => {
        expect(
            flipAndOrToOrAnd(
                [["a"], ["e", "f"]],
                new Map([
                    ["a", 0],
                    ["b", 1],
                    ["c", 2],
                    ["d", 3],
                    ["e", 4],
                    ["f", 5],
                ]),
            ),
        ).toEqual([
            ["a", "e"],
            ["a", "f"],
        ]);
        expect(
            flipAndOrToOrAnd(
                [["e", "f"], ["a"]],
                new Map([
                    ["a", 0],
                    ["b", 1],
                    ["c", 2],
                    ["d", 3],
                    ["e", 4],
                    ["f", 5],
                ]),
            ),
        ).toEqual([
            ["a", "e"],
            ["a", "f"],
        ]);
    });

    it("should return [a&c, b&d, b&c, b&d]", () => {
        expect(
            flipAndOrToOrAnd(
                [
                    ["a", "b"],
                    ["c", "d"],
                ],
                new Map([
                    ["a", 0],
                    ["b", 1],
                    ["c", 2],
                    ["d", 3],
                ]),
            ),
        ).toEqual([
            ["b", "d"],
            ["a", "c"],
            ["b", "c"],
            ["a", "d"],
        ]);
    });

    it("should skip redundant combinations", () => {
        expect(
            flipAndOrToOrAnd(
                [["a", "b"], ["c"], ["b"]],
                new Map([
                    ["a", 0],
                    ["b", 1],
                    ["c", 2],
                ]),
            ),
        ).toEqual([["b", "c"]]);
    });

    it("should return [a&b, a&c, b&c] (skipping a&b&c)", () => {
        expect(
            flipAndOrToOrAnd(
                [
                    ["a", "b"],
                    ["a", "c"],
                    ["b", "c"],
                ],
                new Map([
                    ["a", 0],
                    ["b", 1],
                    ["c", 2],
                ]),
            ),
        ).toEqual([
            ["a", "b"],
            ["a", "c"],
            ["b", "c"],
        ]);
    });

    it("skip all other optional subsets", () => {
        expect(
            flipAndOrToOrAnd(
                [[], ["a"], [], ["b", "c", "d"], ["c"], ["a", "b"]],
                new Map([
                    ["a", 0],
                    ["b", 1],
                    ["c", 2],
                ]),
            ),
        ).toEqual([["a", "c"]]);
    });
});

describe("createPermutations", () => {
    it("should return []", () => {
        expect(createPermutations([], new Map())).toEqual([]);
    });

    it("should return [a]", () => {
        expect(createPermutations(["a"], new Map([["a", 0]]))).toEqual([["a"]]);
    });

    it("should return [a, b, a&b]", () => {
        expect(
            createPermutations(
                ["a", "b"],
                new Map([
                    ["a", 0],
                    ["b", 1],
                ]),
            ),
        ).toEqual([["a"], ["b"], ["a", "b"]]);
    });

    it("should return [a, b, a&b, c, a&c, b&c, a&b&c]", () => {
        expect(
            createPermutations(
                ["a", "b", "c"],
                new Map([
                    ["a", 0],
                    ["b", 1],
                    ["c", 2],
                ]),
            ),
        ).toEqual([["a"], ["b"], ["a", "b"], ["c"], ["a", "c"], ["b", "c"], ["a", "b", "c"]]);
    });
});

describe("modifyRolesForEveryone", () => {
    it("should return [[EVERYONE_ROLE]] if the docs site does not have auth enabled", () => {
        expect(modifyRolesForEveryone([], false)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
        expect(modifyRolesForEveryone([["a"]], false)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
        expect(modifyRolesForEveryone([["a", "c"], ["b"]], false)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
    });

    it("should return [[EVERYONE_ROLE]] if any of the roles contain JUST 'everyone'", () => {
        expect(modifyRolesForEveryone([[EVERYONE_ROLE]], true)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
        expect(modifyRolesForEveryone([["a"], [EVERYONE_ROLE]], true)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
        expect(modifyRolesForEveryone([[EVERYONE_ROLE], ["a"], [], [EVERYONE_ROLE, "b", "c"]], true)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
    });

    it("should remove 'everyone' from each of the role lists if no roles contain JUST 'everyone'", () => {
        expect(modifyRolesForEveryone([["a"], ["b"]], true)).toEqual({
            roles: [["a"], ["b"]],
            authed: true,
        });
        expect(modifyRolesForEveryone([[EVERYONE_ROLE, "a"], ["b"]], true)).toEqual({
            roles: [["a"], ["b"]],
            authed: true,
        });
    });

    it("should return [EVERYONE] if there are no roles", () => {
        expect(modifyRolesForEveryone([], false)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
        expect(modifyRolesForEveryone([[], []], false)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: false,
        });
        expect(modifyRolesForEveryone([], true)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: true,
        });
        expect(modifyRolesForEveryone([[], []], true)).toEqual({
            roles: [[EVERYONE_ROLE]],
            authed: true,
        });
    });
});
