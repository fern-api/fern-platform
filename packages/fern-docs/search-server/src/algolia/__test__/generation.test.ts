import { DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import fs from "fs";
import path from "path";
import { createAlgoliaRecords } from "../records/create-algolia-records";

const fixturesDir = path.join(
  __dirname,
  "../../../../../fdr-sdk/src/__test__/fixtures"
);

function readFixture(fixture: string) {
  const fixturePath = path.join(fixturesDir, `${fixture}.json`);
  const content = fs.readFileSync(fixturePath, "utf-8");
  return JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;
}

for (const fixtureName of [
  "athena",
  "airtop-dev",
  "stack-auth",
  "yes-version-no-tabs",
  "credal",
  "no-version-no-tabs",
  "octoai",
  "thera-staging",
  "primer",
  "propexo",
  "scoutos",
  "intrinsic",
  "vellum",
  "beehiiv",
  "uploadcare",
  "keet",
  "cohere",
  "assemblyai",
  "ferry",
  "humanloop",
  "astronomer",
  "flatfile",
  // "monite",
  "navipartner",
  "boundary",
  "twelvelabs",
  "polytomic",
  "yes-version-yes-tabs",
  "hume",
  "no-version-yes-tabs",
]) {
  // eslint-disable-next-line vitest/valid-title
  describe(fixtureName, () => {
    it("should work", async () => {
      const fixture = readFixture(fixtureName);
      const mockGetPresignedDocsAssetsDownloadUrl = vi.fn();
      const root = FernNavigation.utils.toRootNode(fixture);
      const apis = await FernNavigation.utils.toApis(
        fixture,
        mockGetPresignedDocsAssetsDownloadUrl
      );
      const pages = FernNavigation.utils.toPages(fixture);

      const { records, tooLarge } = createAlgoliaRecords({
        root,
        domain: "test.com",
        org_id: "test",
        pages,
        apis,
      });

      expect(tooLarge.length).toBe(0);

      records.forEach((record) => {
        if (record.description != null) {
          expect(record.description.length).toBeLessThanOrEqual(50_000);
        }

        if (record.type === "markdown" && record.content != null) {
          expect(record.content.length).toBeLessThanOrEqual(50_000);
        }
      });
      await expect(JSON.stringify(records, null, 2)).toMatchFileSnapshot(
        path.join("__snapshots__", `${fixtureName}.test.ts.json`)
      );
    });
  });
}
