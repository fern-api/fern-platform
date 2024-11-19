import { default as CONFIG } from "./fixtures/title/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("title", () => {
    testGenerateReadme({
        fixtureName: "title",
        config: CONFIG,
    });
});
