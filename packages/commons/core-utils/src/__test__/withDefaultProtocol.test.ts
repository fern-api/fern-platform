import { describe, expect, it } from "vitest";

import { withDefaultProtocol } from "../withDefaultProtocol";

describe("withDefaultProtocol", () => {
  it("adds https:// to a domain without protocol", () => {
    expect(withDefaultProtocol("example.com")).toBe("https://example.com");
  });

  it("does not modify a URL that already has https://", () => {
    expect(withDefaultProtocol("https://example.com")).toBe(
      "https://example.com"
    );
  });

  it("does not modify a URL that already has http://", () => {
    expect(withDefaultProtocol("http://example.com")).toBe(
      "http://example.com"
    );
  });

  it("does not modify URLs with other protocols", () => {
    expect(withDefaultProtocol("ftp://example.com")).toBe("ftp://example.com");
  });

  it("handles mixed case protocols", () => {
    expect(withDefaultProtocol("HtTp://example.com")).toBe(
      "HtTp://example.com"
    );
  });

  it("handles an empty string", () => {
    expect(() => withDefaultProtocol("")).toThrow();
  });

  it("handles IP addresses", () => {
    expect(withDefaultProtocol("192.168.1.1")).toBe("https://192.168.1.1");
  });

  it("handles URLs with ports", () => {
    expect(withDefaultProtocol("example.com:8080")).toBe(
      "https://example.com:8080"
    );
  });

  it("handles URLs with authentication", () => {
    expect(withDefaultProtocol("user:pass@example.com")).toBe(
      "https://user:pass@example.com"
    );
  });

  it("handles URLs with www", () => {
    expect(withDefaultProtocol("www.example.com")).toBe(
      "https://www.example.com"
    );
  });

  it("handles URLs with subdomains", () => {
    expect(withDefaultProtocol("subdomain.example.com")).toBe(
      "https://subdomain.example.com"
    );
  });

  it("handles URLs with paths", () => {
    expect(withDefaultProtocol("example.com/path/to/resource")).toBe(
      "https://example.com/path/to/resource"
    );
  });

  it("handles URLs with query parameters", () => {
    expect(withDefaultProtocol("example.com?param1=value1&param2=value2")).toBe(
      "https://example.com?param1=value1&param2=value2"
    );
  });

  it("handles double slashes in the path", () => {
    expect(withDefaultProtocol("example.com//path//to//resource")).toBe(
      "https://example.com//path//to//resource"
    );
  });

  it("handles URLs with :// in the path", () => {
    expect(
      withDefaultProtocol("example.com/path/to/resource/with/colon://in/path")
    ).toBe("https://example.com/path/to/resource/with/colon://in/path");
  });

  it("handles URLs with :// in query parameters", () => {
    expect(
      withDefaultProtocol("example.com?param1=value1&param2=colon://in/value")
    ).toBe("https://example.com?param1=value1&param2=colon://in/value");
  });

  it("handles URLs with :// in fragment", () => {
    expect(withDefaultProtocol("example.com/path#fragment://with/colon")).toBe(
      "https://example.com/path#fragment://with/colon"
    );
  });

  it("handles URLs with :// as part of a file name", () => {
    expect(withDefaultProtocol("example.com/file:with/colon.txt")).toBe(
      "https://example.com/file:with/colon.txt"
    );
  });

  it("handles URLs with :// in a path segment", () => {
    expect(withDefaultProtocol("example.com/path/segment:with/colon")).toBe(
      "https://example.com/path/segment:with/colon"
    );
  });
});
