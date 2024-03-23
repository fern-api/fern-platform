import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";
import { testGetNavigationRoot } from "./testGetNavigationRoot";

const FIXTURE = "uploadcare";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "docs");
    testGetNavigationRoot(FIXTURE, "docs/introduction");
    testGetNavigationRoot(FIXTURE, "docs/introduction/intro");
    testGetNavigationRoot(FIXTURE, "docs/integrations");
    testGetNavigationRoot(FIXTURE, "docs/file-management");
    testGetNavigationRoot(FIXTURE, "docs/file-management/overview");
    testGetNavigationRoot(FIXTURE, "api/url-api");
});
