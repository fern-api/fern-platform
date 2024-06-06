import { testGenerateReadme } from "./testGenerateReadme";

describe("basic-go", () => {
    testGenerateReadme({
        fixtureName: "basic-go",
        readmeConfigFilename: "readme.json",
    });
});
