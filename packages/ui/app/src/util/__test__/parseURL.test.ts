import { parseURL } from "../parseURL";

describe("parseURL", () => {
    it("should return a URL object", () => {
        const url = parseURL("https://example.com");
        expect(url).toBeInstanceOf(URL);
        expect(url.toString()).toBe("https://example.com/");

        const url2 = parseURL("https://example.com/");
        expect(url2).toBeInstanceOf(URL);
        expect(url2.toString()).toBe("https://example.com/");
    });

    it("should retain trailing slash", () => {
        const url3 = parseURL("https://example.com/v1");
        expect(url3).toBeInstanceOf(URL);
        expect(url3.toString()).toBe("https://example.com/v1");

        const url4 = parseURL("https://example.com/v1/");
        expect(url4).toBeInstanceOf(URL);
        expect(url4.toString()).toBe("https://example.com/v1/");
    });

    it("should handle missing protocol", () => {
        const url5 = parseURL("example.com/v1/api");
        expect(url5).toBeInstanceOf(URL);
        expect(url5.toString()).toBe("https://example.com/v1/api");

        const url6 = parseURL("example.com/v1/api/?query=1#hash");
        expect(url6).toBeInstanceOf(URL);
        expect(url6.toString()).toBe("https://example.com/v1/api/?query=1#hash");
        expect(url6.search).toBe("?query=1");
        expect(url6.hash).toBe("#hash");
    });

    it("shouldn't parse away leading n", () => {
        const url7 = parseURL("n.com/v1/api/?query=1#hash");
        expect(url7).toBeInstanceOf(URL);
        expect(url7.toString()).toBe("https://n.com/v1/api/?query=1#hash");

        const url8 = parseURL("https://n.com/v1/api/?query=1#hash");
        expect(url8).toBeInstanceOf(URL);
        expect(url8.toString()).toBe("https://n.com/v1/api/?query=1#hash");

        const url9 = parseURL("https://n/v1/api/?query=1#hash");
        expect(url9).toBeInstanceOf(URL);
        expect(url9.toString()).toBe("https://n/v1/api/?query=1#hash");
    });

    it("should not throw on special characters", () => {
        const url9 = parseURL("https://n.com/v1/a%pi/?query=1#hash");
        expect(url9).toBeInstanceOf(URL);
        expect(url9.toString()).toBe("https://n.com/v1/a%pi/?query=1#hash");
    });

    it("should retain original protocol", () => {
        const url10 = parseURL("http://example.com");
        expect(url10).toBeInstanceOf(URL);
        expect(url10.toString()).toBe("http://example.com/");

        const url11 = parseURL("mailto:n@example.com");
        expect(url11).toBeInstanceOf(URL);
        expect(url11.toString()).toBe("mailto:n@example.com");

        const url12 = parseURL("tel:n@example.com");
        expect(url12).toBeInstanceOf(URL);
        expect(url12.toString()).toBe("tel:n@example.com");
    });
});
