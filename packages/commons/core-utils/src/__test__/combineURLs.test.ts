import { describe, expect, it } from "vitest";
import { combineURLs } from "../combineURLs";

// Test cases from [Axios](https://github.com/axios/axios/blob/fe7d09bb08fa1c0e414956b7fc760c80459b0a43/test/specs/helpers/combineURLs.spec.js)

describe("helpers::combineURLs", function () {
  it("should combine URLs", function () {
    expect(combineURLs("https://api.github.com", "/users")).toBe(
      "https://api.github.com/users"
    );
  });

  it("should remove duplicate slashes", function () {
    expect(combineURLs("https://api.github.com/", "/users")).toBe(
      "https://api.github.com/users"
    );
  });

  it("should insert missing slash", function () {
    expect(combineURLs("https://api.github.com", "users")).toBe(
      "https://api.github.com/users"
    );
  });

  it("should not insert slash when relative url missing/empty", function () {
    expect(combineURLs("https://api.github.com/users", "")).toBe(
      "https://api.github.com/users"
    );
  });

  it("should allow a single slash for relative url", function () {
    expect(combineURLs("https://api.github.com/users", "/")).toBe(
      "https://api.github.com/users/"
    );
  });
});
