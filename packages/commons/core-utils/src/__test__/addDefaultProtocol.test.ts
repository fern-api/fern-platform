import { describe, expect, it } from "vitest";
import { addDefaultProtocol } from "../addDefaultProtocol";

describe("addDefaultProtocol", () => {
    it("adds https:// to a domain without protocol", () => {
        expect(addDefaultProtocol("example.com")).toBe("https://example.com");
    });

    it("does not modify a URL that already has https://", () => {
        expect(addDefaultProtocol("https://example.com")).toBe("https://example.com");
    });

    it("does not modify a URL that already has http://", () => {
        expect(addDefaultProtocol("http://example.com")).toBe("http://example.com");
    });

    it("does not modify URLs with other protocols", () => {
        expect(addDefaultProtocol("ftp://example.com")).toBe("ftp://example.com");
    });

    it("handles mixed case protocols", () => {
        expect(addDefaultProtocol("HtTp://example.com")).toBe("HtTp://example.com");
    });

    it("handles an empty string", () => {
        expect(addDefaultProtocol("")).toBe("https://");
    });

    it("handles IP addresses", () => {
        expect(addDefaultProtocol("192.168.1.1")).toBe("https://192.168.1.1");
    });

    it("handles URLs with ports", () => {
        expect(addDefaultProtocol("example.com:8080")).toBe("https://example.com:8080");
    });

    it("handles URLs with authentication", () => {
        expect(addDefaultProtocol("user:pass@example.com")).toBe("https://user:pass@example.com");
    });

    it("handles URLs with www", () => {
        expect(addDefaultProtocol("www.example.com")).toBe("https://www.example.com");
    });

    it("handles URLs with subdomains", () => {
        expect(addDefaultProtocol("subdomain.example.com")).toBe("https://subdomain.example.com");
    });

    it("handles URLs with paths", () => {
        expect(addDefaultProtocol("example.com/path/to/resource")).toBe("https://example.com/path/to/resource");
    });

    it("handles URLs with query parameters", () => {
        expect(addDefaultProtocol("example.com?param1=value1&param2=value2")).toBe(
            "https://example.com?param1=value1&param2=value2",
        );
    });

    it("handles double slashes in the path", () => {
        expect(addDefaultProtocol("example.com//path//to//resource")).toBe("https://example.com//path//to//resource");
    });

    it("handles URLs with :// in the path", () => {
        expect(addDefaultProtocol("example.com/path/to/resource/with/colon://in/path")).toBe(
            "https://example.com/path/to/resource/with/colon://in/path",
        );
    });

    it("handles URLs with :// in query parameters", () => {
        expect(addDefaultProtocol("example.com?param1=value1&param2=colon://in/value")).toBe(
            "https://example.com?param1=value1&param2=colon://in/value",
        );
    });

    it("handles URLs with :// in fragment", () => {
        expect(addDefaultProtocol("example.com/path#fragment://with/colon")).toBe(
            "https://example.com/path#fragment://with/colon",
        );
    });

    it("handles URLs with :// as part of a file name", () => {
        expect(addDefaultProtocol("example.com/file:with/colon.txt")).toBe("https://example.com/file:with/colon.txt");
    });

    it("handles URLs with :// in a path segment", () => {
        expect(addDefaultProtocol("example.com/path/segment:with/colon")).toBe(
            "https://example.com/path/segment:with/colon",
        );
    });
});
