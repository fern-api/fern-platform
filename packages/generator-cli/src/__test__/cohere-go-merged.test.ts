import { testGenerateReadme } from "./testGenerateReadme";

describe("cohere-go-merged", () => {
    testGenerateReadme({
        fixtureName: "cohere-go-merged",
        readmeConfigFilename: "readme.json",
        originalReadme: "README.md",
    });
});
