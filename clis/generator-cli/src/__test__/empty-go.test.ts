import { testGenerateReadme } from "./testGenerateReadme";

describe("empty-go", () => {
    testGenerateReadme({
        fixtureName: "empty-go",
        readmeConfigFilename: "readme.json",
    });
});
