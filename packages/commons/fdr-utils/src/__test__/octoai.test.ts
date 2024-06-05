import { describe } from "vitest";
import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig.js";
import { testGetNavigationRoot } from "./testGetNavigationRoot.js";

const FIXTURE = "octoai";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig(FIXTURE);
});

describe("getNavigationRoot", () => {
    testGetNavigationRoot(FIXTURE, "getting-started");
    testGetNavigationRoot(FIXTURE, "getting-started/quickstart");
    testGetNavigationRoot(FIXTURE, "api-reference/octoai-api/authentication");
    testGetNavigationRoot(FIXTURE, "api-reference/octoai-api/account/get-account");
    testGetNavigationRoot(FIXTURE, "api-reference/asset-library/list");
});
