import { testGenerateReadme } from "./testGenerateReadme";

describe("cohere-go", () => {
    testGenerateReadme({
        fixtureName: "cohere-go",
        readmeConfigFilename: "readme.json",
    });
});
