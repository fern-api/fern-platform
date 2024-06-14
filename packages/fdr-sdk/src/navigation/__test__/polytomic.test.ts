import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";
import { testGetNavigationRoot } from "./testGetNavigationRoot";

const FIXTURE = "polytomic";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "guides/introduction");
    testGetNavigationRoot(FIXTURE, "2024-02-08/guides/introduction");
    testGetNavigationRoot(FIXTURE, "2023-04-25/guides/introduction");
    testGetNavigationRoot(FIXTURE, "2023-04-25/not-found");
});
