import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig.js";
import { testGetNavigationRoot } from "./testGetNavigationRoot.js";

const FIXTURE = "no-version-yes-tabs";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "docs/api");
    testGetNavigationRoot(FIXTURE, "docs/api/tab-1");
    testGetNavigationRoot(FIXTURE, "docs/api/section-1");
    testGetNavigationRoot(FIXTURE, "docs/api/page-2");
    testGetNavigationRoot(FIXTURE, "docs/api/tab-2");
    testGetNavigationRoot(FIXTURE, "docs/api/tab-2/section-5");
});
