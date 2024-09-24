import { DocsV2Read } from "@fern-api/fdr-sdk";
import { getRedirectForPath } from "../getRedirectForPath";

const MOCK_BASE_URL_0 = {
    domain: "example.com",
    basePath: undefined,
} satisfies DocsV2Read.BaseUrl;

const MOCK_BASE_URL_1 = {
    domain: "example.com",
    basePath: "/docs",
} satisfies DocsV2Read.BaseUrl;

describe("getRedirectForPath", () => {
    it("should return undefined if no redirect matches", () => {
        expect(
            getRedirectForPath("/foo", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "/baz", permanent: undefined },
            ]),
        ).toBeUndefined();
    });

    it("should return redirect if source matches exactly", () => {
        expect(
            getRedirectForPath("/bar", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "/baz", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz", permanent: false },
        });
    });

    it("should return redirect if source matches with trailing slash", () => {
        expect(
            getRedirectForPath("/bar/", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "/baz", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz", permanent: false },
        });
        expect(
            getRedirectForPath("/bar", MOCK_BASE_URL_0, [
                { source: "/bar/", destination: "/baz/", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/", permanent: false },
        });
    });

    it("should return redirect if source matches omitting basepath", () => {
        expect(
            getRedirectForPath("/docs/bar", MOCK_BASE_URL_1, [
                { source: "/bar", destination: "/baz", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz", permanent: false },
        });
        expect(
            getRedirectForPath("/docs/bar", MOCK_BASE_URL_1, [
                { source: "/bar/", destination: "/baz/", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/", permanent: false },
        });
    });

    it("should return redirect if source matches with basepath", () => {
        expect(
            getRedirectForPath("/docs/bar", MOCK_BASE_URL_1, [
                { source: "/docs/bar", destination: "/baz", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz", permanent: false },
        });
        expect(
            getRedirectForPath("/docs/bar", MOCK_BASE_URL_1, [
                { source: "/docs/bar/", destination: "/baz/", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/", permanent: false },
        });
    });

    it("should return redirect if source matches params", () => {
        expect(
            getRedirectForPath("/bar/123", MOCK_BASE_URL_0, [
                { source: "/bar/:id", destination: "/baz/:id", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/123", permanent: false },
        });
        expect(
            getRedirectForPath("/bar/123", MOCK_BASE_URL_0, [
                { source: "/bar/:id", destination: "/baz/:id/", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/123/", permanent: false },
        });
    });

    it("should return redirect if source matches params with basepath", () => {
        expect(
            getRedirectForPath("/docs/bar/123", MOCK_BASE_URL_1, [
                { source: "/bar/:id", destination: "/baz/:id", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/123", permanent: false },
        });
        expect(
            getRedirectForPath("/docs/bar/123", MOCK_BASE_URL_1, [
                { source: "/docs/bar/:id", destination: "/baz/:id", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/123", permanent: false },
        });
    });

    it("should return redirect for wildcard", () => {
        expect(
            getRedirectForPath("/docs/bar/123/456", MOCK_BASE_URL_1, [
                { source: "/docs/bar/:path*", destination: "/baz/:path*", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/123/456", permanent: false },
        });
        expect(
            getRedirectForPath("/docs/bar/123/456/", MOCK_BASE_URL_1, [
                { source: "/docs/bar/:path*/", destination: "/baz/:path*/", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/123/456/", permanent: false },
        });
    });

    it("should respect regex", () => {
        expect(
            getRedirectForPath("/bar/123", MOCK_BASE_URL_0, [
                { source: "/bar/:id(\\d+)", destination: "/baz/:id", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/123", permanent: false },
        });

        expect(
            getRedirectForPath("/bar/abc", MOCK_BASE_URL_0, [
                { source: "/bar/:id(\\d+)", destination: "/baz/:id", permanent: undefined },
            ]),
        ).toBeUndefined();

        expect(
            getRedirectForPath("/bar/abc", MOCK_BASE_URL_0, [
                { source: "/bar/:id(\\w+)", destination: "/baz/:id", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/abc", permanent: false },
        });

        expect(
            getRedirectForPath("/bar/efg", MOCK_BASE_URL_0, [
                { source: "/bar/:param(abc|efg)", destination: "/baz/:param", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz/efg", permanent: false },
        });
    });

    it("should encode the destination", () => {
        expect(
            getRedirectForPath("/bar", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "/baz?foo=bar", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/baz?foo=bar", permanent: false },
        });
        expect(
            getRedirectForPath("/bar", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "/a%b", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "/a%25b", permanent: false },
        });
    });

    it("should not try to redirect to a bad destination", () => {
        expect(
            getRedirectForPath("/bar", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "https://n", permanent: undefined },
            ]),
        ).toEqual({
            redirect: { destination: "https://n", permanent: false },
        });
        expect(
            getRedirectForPath("/bar", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "x/b/c", permanent: undefined },
            ]),
        ).toBeUndefined();
        expect(
            getRedirectForPath("/bar", MOCK_BASE_URL_0, [
                { source: "/bar", destination: "absolutely", permanent: undefined },
            ]),
        ).toBeUndefined();
    });
});
