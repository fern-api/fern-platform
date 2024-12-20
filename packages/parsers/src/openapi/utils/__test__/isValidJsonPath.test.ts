import { isValidJsonPath } from "../isValidJsonPath";

describe("isValidJsonPath", () => {
  it("should return true for valid JSON paths", () => {
    expect(isValidJsonPath("$.store.book[0].title")).toBe(true);
    expect(isValidJsonPath("$.store.book[*].title")).toBe(true);
    expect(isValidJsonPath("$['store']['book'][0]['title']")).toBe(true);
    expect(isValidJsonPath("$.store.book[1:3]")).toBe(true);
    expect(isValidJsonPath("$.store.*")).toBe(true);
    expect(isValidJsonPath("$")).toBe(true);
  });

  it("should return false for invalid JSON paths", () => {
    expect(isValidJsonPath("")).toBe(false);
    expect(isValidJsonPath("invalid")).toBe(false);
    expect(isValidJsonPath("$.store.#invalid")).toBe(false);
    expect(isValidJsonPath("$.store[abc]")).toBe(false);
    expect(isValidJsonPath("$.store[]")).toBe(false);
    expect(isValidJsonPath("$.store.book[0]]")).toBe(false);
    expect(isValidJsonPath("$..store")).toBe(false);
  });
});
