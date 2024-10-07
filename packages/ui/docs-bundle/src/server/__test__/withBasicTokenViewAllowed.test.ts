import { withBasicTokenPublic } from "../withBasicTokenPublic";

describe("withBasicTokenPublic", () => {
    it("should deny the request if the allowlist is empty", () => {
        expect(withBasicTokenPublic({}, "/public")).toBe(false);
        expect(withBasicTokenPublic({ allowlist: [] }, "/public")).toBe(false);
    });

    it("should allow the request to pass through if the path is in the allowlist", () => {
        expect(withBasicTokenPublic({ allowlist: ["/public"] }, "/public")).toBe(true);
    });

    it("should allow the request to pass through if the path matches a regex in the allowlist", () => {
        expect(withBasicTokenPublic({ allowlist: ["/public/(.*)"] }, "/public/123")).toBe(true);
    });

    it("should allow the request to pass through if the path matches a path expression in the allowlist", () => {
        expect(withBasicTokenPublic({ allowlist: ["/public/:id"] }, "/public/123")).toBe(true);
    });

    it("should not allow the request to pass through if the path is not in the allowlist", () => {
        expect(withBasicTokenPublic({ allowlist: ["/public", "/public/:id"] }, "/private")).toBe(false);
        expect(withBasicTokenPublic({ allowlist: ["/public", "/public/:id"] }, "/private/123")).toBe(false);
    });

    it("shouuld respect denylist before allowlist", () => {
        expect(withBasicTokenPublic({ allowlist: ["/public"], denylist: ["/public"] }, "/public")).toBe(false);
    });
});
