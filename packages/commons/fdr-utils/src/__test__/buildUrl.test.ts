import { buildUrl, getHostFromUrl } from "../buildUrl";

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

describe("buildUrl", () => {
    it("should build url without pathname", () => {
        expect(buildUrl({ host: "localhost", pathname: "" })).toBe("localhost");
        expect(buildUrl({ host: "localhost:3000", pathname: "" })).toBe("localhost:3000");
        expect(buildUrl({ host: "localhost:3000/", pathname: "" })).toBe("localhost:3000");
    });

    it("should build url with pathname", () => {
        expect(buildUrl({ host: "localhost", pathname: "docs" })).toBe("localhost/docs");
        expect(buildUrl({ host: "localhost:3000", pathname: "docs" })).toBe("localhost:3000/docs");
        expect(buildUrl({ host: "localhost:3000/", pathname: "docs" })).toBe("localhost:3000/docs");
    });

    it("should build url with pathname and strip trailing slash", () => {
        expect(buildUrl({ host: "localhost", pathname: "docs/" })).toBe("localhost/docs");
        expect(buildUrl({ host: "localhost:3000", pathname: "docs/" })).toBe("localhost:3000/docs");
        expect(buildUrl({ host: "localhost:3000/", pathname: "docs/" })).toBe("localhost:3000/docs");
    });

    it("should build url with pathname and strip leading slash", () => {
        expect(buildUrl({ host: "localhost", pathname: "/docs/api" })).toBe("localhost/docs/api");
        expect(buildUrl({ host: "localhost:3000", pathname: "/docs/api" })).toBe("localhost:3000/docs/api");
        expect(buildUrl({ host: "localhost:3000/", pathname: "/docs/api" })).toBe("localhost:3000/docs/api");
    });

    it("should build url with pathname and strip leading and trailing slash", () => {
        expect(buildUrl({ host: "localhost", pathname: "/docs/api/" })).toBe("localhost/docs/api");
        expect(buildUrl({ host: "localhost:3000", pathname: "/docs/api/" })).toBe("localhost:3000/docs/api");
        expect(buildUrl({ host: "localhost:3000/", pathname: "/docs/api/" })).toBe("localhost:3000/docs/api");
    });

    it("should encode URL", () => {
        expect(buildUrl({ host: "localhost", pathname: "docs/api/with space" })).toBe(
            "localhost/docs/api/with%20space",
        );
        expect(buildUrl({ host: "localhost:3000", pathname: "docs/api/with space" })).toBe(
            "localhost:3000/docs/api/with%20space",
        );
        expect(buildUrl({ host: "localhost:3000/", pathname: "docs/api/with space" })).toBe(
            "localhost:3000/docs/api/with%20space",
        );
        expect(buildUrl({ host: "localhost", pathname: "docs/api/with space/" })).toBe(
            "localhost/docs/api/with%20space",
        );
        expect(buildUrl({ host: "localhost:3000", pathname: "docs/api/with space/" })).toBe(
            "localhost:3000/docs/api/with%20space",
        );
        expect(buildUrl({ host: "localhost:3000/", pathname: "docs/api/with space/" })).toBe(
            "localhost:3000/docs/api/with%20space",
        );
    });
});
