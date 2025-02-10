import { describe, expect, it } from "vitest";

import { toOpenApiPath } from "../toOpenApiPath";

describe("toOpenApiPath", () => {
  it("should create path with single element", () => {
    expect(toOpenApiPath(["components"])).toBe("#/components");
  });

  it("should create path with multiple elements", () => {
    expect(toOpenApiPath(["components", "schemas", "Pet"])).toBe(
      "#/components/schemas/Pet"
    );
  });

  it("should handle empty array", () => {
    expect(toOpenApiPath([])).toBe("#/");
  });

  it("should handle elements with special characters", () => {
    expect(toOpenApiPath(["path", "with spaces", "special/char"])).toBe(
      "#/path/with spaces/special~1char"
    );
  });
});
