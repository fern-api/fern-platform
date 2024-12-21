import { describe } from "vitest";
import { FernNavigation } from "..";
import { FernNavigationV1ToLatest } from "../navigation/migrators/v1ToV2";
import { readFixture } from "./readFixtures";
import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";
import { testGetNavigationRoot } from "./testGetNavigationRoot";

const FIXTURE = "octoai";
const slugs = [
  "getting-started",
  "getting-started/quickstart",
  "api-reference/octoai-api/authentication",
  "api-reference/octoai-api/account/get-account",
  "api-reference/asset-library/list",
];

// eslint-disable-next-line vitest/valid-title
describe(FIXTURE, () => {
  const fixture = readFixture(FIXTURE);
  const v1 = FernNavigation.V1.toRootNode(fixture);
  const latest = FernNavigationV1ToLatest.create().root(v1);

  testGetAllUrlsFromDocsConfig(latest, fixture.baseUrl.domain);
  slugs.forEach((slug) => {
    testGetNavigationRoot(latest, slug);
  });
});
