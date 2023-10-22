import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

describe("ParsedBaseUrl", () => {
    it("fern.docs.buildwithfern.com", () => {
        const parsedUrl = ParsedBaseUrl.parse("https://fern.docs.buildwithfern.com");
        expect(parsedUrl.hostname).toEqual("fern.docs.buildwithfern.com");
        expect(parsedUrl.path).toBeUndefined();
    });

    it("buildwithfern.com/docs", () => {
        const parsedUrl = ParsedBaseUrl.parse("https://buildwithfern.com/docs");
        expect(parsedUrl.hostname).toEqual("buildwithfern.com");
        expect(parsedUrl.path).toEqual("/docs");
        expect(parsedUrl.getFullUrl()).toEqual("buildwithfern.com/docs");
    });
});
