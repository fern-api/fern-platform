import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig.js";
import { testGetNavigationRoot } from "./testGetNavigationRoot.js";

const FIXTURE = "yes-version-no-tabs";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "docs/api");
    testGetNavigationRoot(FIXTURE, "docs/api/section-1");
    testGetNavigationRoot(FIXTURE, "docs/api/page-5");
    testGetNavigationRoot(FIXTURE, "docs/api/version-1");
    testGetNavigationRoot(FIXTURE, "docs/api/version-1");
    testGetNavigationRoot(FIXTURE, "docs/api/version-1/section-1");
    testGetNavigationRoot(FIXTURE, "docs/api/version-1/page-5");
    testGetNavigationRoot(FIXTURE, "docs/api/version-1/version-1");
    testGetNavigationRoot(FIXTURE, "docs/api/version-2");
    testGetNavigationRoot(FIXTURE, "docs/api/version-2/version-1");
});
