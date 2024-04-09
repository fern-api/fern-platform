import { buildUrl } from "../buildUrl";

describe("buildUrl", () => {
    it("should return the correct url", () => {
        expect(buildUrl({ host: "mydocs.docs.buildwithfern.com", pathname: "path/to/page" })).toEqual(
            "mydocs.docs.buildwithfern.com/path/to/page",
        );
    });

    it("should correctly handle urls with 'https://'", () => {
        expect(buildUrl({ host: "https://mydocs.docs.buildwithfern.com", pathname: "path/to/page" })).toEqual(
            "mydocs.docs.buildwithfern.com/path/to/page",
        );
    });

    it("should correctly handle urls with trailing slashes", () => {
        expect(buildUrl({ host: "mydocs.docs.buildwithfern.com/", pathname: "path/to/page" })).toEqual(
            "mydocs.docs.buildwithfern.com/path/to/page",
        );
    });

    it("should correctly handle pathnames with leading slashes", () => {
        expect(buildUrl({ host: "mydocs.docs.buildwithfern.com", pathname: "/path/to/page" })).toEqual(
            "mydocs.docs.buildwithfern.com/path/to/page",
        );
    });

    it("should correctly handle both 'https://' and trailing slashes at host", () => {
        expect(buildUrl({ host: "https://mydocs.docs.buildwithfern.com/", pathname: "path/to/page" })).toEqual(
            "mydocs.docs.buildwithfern.com/path/to/page",
        );
    });

    it("should correctly handle 'https://', trailing slashes at host and leading slash at pathname", () => {
        expect(buildUrl({ host: "https://mydocs.docs.buildwithfern.com/", pathname: "/path/to/page" })).toEqual(
            "mydocs.docs.buildwithfern.com/path/to/page",
        );
    });
});
