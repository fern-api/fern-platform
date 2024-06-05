import { describe } from "vitest";
import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig.js";
import { testGetNavigationRoot } from "./testGetNavigationRoot.js";

const FIXTURE = "hume";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "support");
    testGetNavigationRoot(FIXTURE, "reference");
    testGetNavigationRoot(FIXTURE, "docs");
    testGetNavigationRoot(FIXTURE, "reference/expression-measurement-api/stream");
});
