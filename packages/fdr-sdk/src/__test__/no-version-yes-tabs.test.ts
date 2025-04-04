import { FernNavigation } from "..";
import { FernNavigationV1ToLatest } from "../navigation/migrators/v1ToV2";
import { readFixture } from "./readFixtures";
import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";
import { testGetNavigationRoot } from "./testGetNavigationRoot";

const FIXTURE = "no-version-yes-tabs";
const slugs = [
  "docs/api",
  "docs/api/tab-1",
  "docs/api/section-1",
  "docs/api/page-2",
  "docs/api/tab-2",
  "docs/api/tab-2/section-5",
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
