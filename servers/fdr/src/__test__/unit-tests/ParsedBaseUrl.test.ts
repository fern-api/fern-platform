import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

describe("ParsedBaseUrl", () => {
  it("fern.docs.buildwithfern.com", () => {
    const parsedUrl = ParsedBaseUrl.parse(
      "https://fern.docs.buildwithfern.com"
    );
    expect(parsedUrl.hostname).toEqual("fern.docs.buildwithfern.com");
    expect(parsedUrl.path).toBeUndefined();
    expect(parsedUrl.getFullUrl()).toEqual("fern.docs.buildwithfern.com");
  });

  it("buildwithfern.com/docs", () => {
    const parsedUrl = ParsedBaseUrl.parse("https://buildwithfern.com/docs");
    expect(parsedUrl.hostname).toEqual("buildwithfern.com");
    expect(parsedUrl.path).toEqual("/docs");
    expect(parsedUrl.getFullUrl()).toEqual("buildwithfern.com/docs");
  });

  it("apidocs.polytomic.com", () => {
    const parsedUrl = ParsedBaseUrl.parse("apidocs.polytomic.com");
    expect(parsedUrl.hostname).toEqual("apidocs.polytomic.com");
    expect(parsedUrl.path).toEqual(undefined);
    expect(parsedUrl.toURL()).toEqual(new URL("https://apidocs.polytomic.com"));
  });

  it("polytomic.docs.buildwithfern.com", () => {
    const parsedUrl = ParsedBaseUrl.parse("polytomic.docs.buildwithfern.com");
    expect(parsedUrl.hostname).toEqual("polytomic.docs.buildwithfern.com");
    expect(parsedUrl.path).toEqual(undefined);
    expect(parsedUrl.toURL()).toEqual(
      new URL("https://polytomic.docs.buildwithfern.com")
    );
  });
});
