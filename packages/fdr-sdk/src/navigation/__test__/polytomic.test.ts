import { FernNavigation } from "../..";
import { FernNavigationV1ToLatest } from "../migrators/v1ToV2";
import { readFixture } from "./readFixtures";
import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";
import { testGetNavigationRoot } from "./testGetNavigationRoot";

const FIXTURE = "polytomic";
const slugs = [
    "guides/introduction",
    "2024-02-08/guides/introduction",
    "2023-04-25/guides/introduction",
    "2023-04-25/not-found",
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
