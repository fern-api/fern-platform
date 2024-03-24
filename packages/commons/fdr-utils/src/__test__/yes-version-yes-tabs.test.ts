import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";
import { testGetNavigationRoot } from "./testGetNavigationRoot";

const FIXTURE = "yes-version-yes-tabs";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "docs/api");
    testGetNavigationRoot(FIXTURE, "docs/api/tab-1");
    testGetNavigationRoot(FIXTURE, "docs/api/tab-2");
    testGetNavigationRoot(FIXTURE, "docs/api/version-1/section-2");
    testGetNavigationRoot(FIXTURE, "docs/api/version-1");
    testGetNavigationRoot(FIXTURE, "docs/api/version-2");
    testGetNavigationRoot(FIXTURE, "docs/api/version-2/tab-2");
    testGetNavigationRoot(FIXTURE, "docs/api/version-2/tab-2/section-5");
});
