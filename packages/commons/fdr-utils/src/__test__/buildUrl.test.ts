import { getHostFromUrl } from "../buildUrl";

describe("getHost", () => {
    it("should return host with port", () => {
        expect(getHostFromUrl("localhost:3000")).toBe("localhost:3000");
        expect(getHostFromUrl("https://localhost:3000")).toBe("localhost:3000");
        expect(getHostFromUrl("https://localhost:3000/")).toBe("localhost:3000");
        expect(getHostFromUrl("https://localhost:3000/docs")).toBe("localhost:3000");
        expect(getHostFromUrl("https://localhost:3000/docs/")).toBe("localhost:3000");
        expect(getHostFromUrl("localhost:3000/")).toBe("localhost:3000");
    });

    it("should return host without port", () => {
        expect(getHostFromUrl("localhost")).toBe("localhost");
        expect(getHostFromUrl("https://localhost")).toBe("localhost");
        expect(getHostFromUrl("https://localhost/")).toBe("localhost");
        expect(getHostFromUrl("https://localhost/docs")).toBe("localhost");
        expect(getHostFromUrl("https://localhost/docs/")).toBe("localhost");
        expect(getHostFromUrl("localhost/")).toBe("localhost");
    });
});
