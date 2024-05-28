import { testGenerateReadme } from "./testGenerateReadme";

describe("basic-go", () => {
    testGenerateReadme({
        fixtureName: "basic-go",
        featuresConfigFilename: "features.yml",
        readmeConfigFilename: "readme.json",
        snippetsFilename: "snippet.json",
    });
});
