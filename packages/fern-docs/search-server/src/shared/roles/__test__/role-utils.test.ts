import { EVERYONE_ROLE } from "@fern-docs/utils";
import {
  createPermutations,
  flipAndOrToOrAnd,
  modifyRolesForEveryone,
} from "../role-utils";

describe("flipAndOrToOrAnd", () => {
  it("should return []", () => {
    expect(flipAndOrToOrAnd([])).toEqual([]);
  });

  it("should return [a]", () => {
    expect(flipAndOrToOrAnd([["a"]])).toEqual([["a"]]);
    expect(flipAndOrToOrAnd([["a", "a"]])).toEqual([["a"]]);
    expect(flipAndOrToOrAnd([["a"], ["a"], ["a"]])).toEqual([["a"]]);
  });

  it("should return [a&b]", () => {
    expect(flipAndOrToOrAnd([["a"], ["b"]])).toEqual([["a", "b"]]);
  });

  it("should return [a&e, a&f]", () => {
    expect(flipAndOrToOrAnd([["a"], ["e", "f"]])).toEqual([
      ["a", "e"],
      ["a", "f"],
    ]);
    expect(flipAndOrToOrAnd([["e", "f"], ["a"]])).toEqual([
      ["a", "e"],
      ["a", "f"],
    ]);
  });

  it("should return [a&c, b&d, b&c, b&d]", () => {
    expect(
      flipAndOrToOrAnd([
        ["a", "b"],
        ["c", "d"],
      ])
    ).toEqual([
      ["a", "c"],
      ["a", "d"],
      ["b", "c"],
      ["b", "d"],
    ]);
  });

  it("should skip redundant combinations", () => {
    expect(flipAndOrToOrAnd([["a", "b"], ["c"], ["b"]])).toEqual([["b", "c"]]);
  });

  it("should return [a&b, a&c, b&c] (skipping a&b&c)", () => {
    expect(
      flipAndOrToOrAnd([
        ["a", "b"],
        ["a", "c"],
        ["b", "c"],
      ])
    ).toEqual([
      ["a", "b"],
      ["a", "c"],
      ["b", "c"],
    ]);
  });

  it("skip all other optional subsets", () => {
    expect(
      flipAndOrToOrAnd([[], ["a"], [], ["b", "c", "d"], ["c"], ["a", "b"]])
    ).toEqual([["a", "c"]]);
  });
});

describe("createPermutations", () => {
  it("should return []", () => {
    expect(createPermutations([])).toEqual([]);
  });

  it("should return [a]", () => {
    expect(createPermutations(["a"])).toEqual([["a"]]);
  });

  it("should return [a, b, a&b]", () => {
    expect(createPermutations(["a", "b"])).toEqual([["a"], ["a", "b"], ["b"]]);
  });

  it("should return [a, b, a&b, c, a&c, b&c, a&b&c]", () => {
    expect(createPermutations(["a", "b", "c"])).toEqual([
      ["a"],
      ["a", "b"],
      ["a", "b", "c"],
      ["a", "c"],
      ["b"],
      ["b", "c"],
      ["c"],
    ]);
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
    expect(
      modifyRolesForEveryone(
        [[EVERYONE_ROLE], ["a"], [], [EVERYONE_ROLE, "b", "c"]],
        true
      )
    ).toEqual({
      roles: [[EVERYONE_ROLE]],
      authed: false,
    });
  });

  it("should remove 'everyone' from each of the role lists if no roles contain JUST 'everyone'", () => {
    expect(modifyRolesForEveryone([["a"], ["b"]], true)).toEqual({
      roles: [["a"], ["b"]],
      authed: true,
    });
    expect(modifyRolesForEveryone([[EVERYONE_ROLE, "a"], ["b"]], true)).toEqual(
      {
        roles: [["a"], ["b"]],
        authed: true,
      }
    );
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
