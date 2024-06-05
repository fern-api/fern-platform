import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig.js";
import { testGetNavigationRoot } from "./testGetNavigationRoot.js";

const FIXTURE = "no-version-no-tabs";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "");
    testGetNavigationRoot(FIXTURE, "docs");
    testGetNavigationRoot(FIXTURE, "docs/api/section-1");
    testGetNavigationRoot(FIXTURE, "docs/api/section-2");
    testGetNavigationRoot(FIXTURE, "docs/api/section-3");
    testGetNavigationRoot(FIXTURE, "docs/api/page-6");
});
