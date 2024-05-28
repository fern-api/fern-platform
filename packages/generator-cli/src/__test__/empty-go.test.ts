import { testGenerateReadme } from "./testGenerateReadme";

describe("empty-go", () => {
    testGenerateReadme({
        fixtureName: "empty-go",
        featuresConfigFilename: "features.yml",
        readmeConfigFilename: "readme.json",
        snippetsFilename: "snippet.json",
    });
});
