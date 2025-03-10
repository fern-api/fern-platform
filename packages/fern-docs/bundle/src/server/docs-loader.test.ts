import { cleanBasePath } from "./docs-loader";

vi.mock("server-only", () => ({}));

describe("basePath", () => {
  it("should clean basepath", () => {
    expect(cleanBasePath(undefined)).toBe("");
    expect(cleanBasePath("")).toBe("");
    expect(cleanBasePath("/")).toBe("");
    expect(cleanBasePath("/foo")).toBe("/foo");
    expect(cleanBasePath("/foo/")).toBe("/foo");
    expect(cleanBasePath("/foo/bar")).toBe("/foo/bar");
    expect(cleanBasePath("/foo/bar/")).toBe("/foo/bar");
  });
});
