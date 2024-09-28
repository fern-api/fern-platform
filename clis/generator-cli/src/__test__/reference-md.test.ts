import { default as CONFIG } from "./fixtures/empty-go/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("reference-md", () => {
    testGenerateReadme({
        fixtureName: "reference-md",
        config: CONFIG,
    });
});
