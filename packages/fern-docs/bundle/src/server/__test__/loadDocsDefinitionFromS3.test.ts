import { loadDocsDefinitionFromS3 } from "../loadDocsDefinitionFromS3";

describe("loadDocsDefinitionFromS3", () => {
  const TEST_DOMAIN = "dubwub.docs.dev.buildwithfern.com";
  const TEST_URL = "https://docs-definitions-dev2.buildwithfern.com";

  it("loads docs definition from S3", async () => {
    const result = await loadDocsDefinitionFromS3({
      domain: TEST_DOMAIN,
      docsDefinitionUrl: TEST_URL,
    });
    expect(result).toBeDefined();
  });

  it("handles non-existent domain", async () => {
    const result = await loadDocsDefinitionFromS3({
      domain: "non-existent-domain",
      docsDefinitionUrl: TEST_URL,
    });
    expect(result).toBeUndefined();
  });
});
