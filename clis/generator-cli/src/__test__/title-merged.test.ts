import { default as CONFIG } from "./fixtures/title-merged/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("title-merged", () => {
    testGenerateReadme({
        fixtureName: "title-merged",
        config: CONFIG,
        originalReadme: "README.md",
    });
});
