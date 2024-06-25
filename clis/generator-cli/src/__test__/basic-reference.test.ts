import { testGenerateReference } from "./testGenerateReference";

describe("basic-reference", () => {
    testGenerateReference({
        fixtureName: "basic-reference",
        referenceConfigFilename: "reference.json",
    });
});
