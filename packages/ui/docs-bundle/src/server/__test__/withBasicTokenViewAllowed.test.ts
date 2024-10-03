import { withBasicTokenViewAllowed } from "../withBasicTokenViewAllowed";

describe("withBasicTokenViewAllowed", () => {
    it("should deny the request if the allowlist is empty", () => {
        expect(withBasicTokenViewAllowed(undefined, "/public")).toBe(false);
        expect(withBasicTokenViewAllowed([], "/public")).toBe(false);
    });

    it("should allow the request to pass through if the path is in the allowlist", () => {
        expect(withBasicTokenViewAllowed(["/public"], "/public")).toBe(true);
    });

    it("should allow the request to pass through if the path matches a regex in the allowlist", () => {
        expect(withBasicTokenViewAllowed(["/public/(.*)"], "/public/123")).toBe(true);
    });

    it("should allow the request to pass through if the path matches a path expression in the allowlist", () => {
        expect(withBasicTokenViewAllowed(["/public/:id"], "/public/123")).toBe(true);
    });

    it("should not allow the request to pass through if the path is not in the allowlist", () => {
        expect(withBasicTokenViewAllowed(["/public", "/public/:id"], "/private")).toBe(false);
        expect(withBasicTokenViewAllowed(["/public", "/public/:id"], "/private/123")).toBe(false);
    });
});
