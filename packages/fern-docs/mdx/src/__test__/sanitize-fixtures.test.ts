import { readFileSync, readdirSync } from "fs";
import path from "path";

import { getFrontmatter } from "../frontmatter";
import { mdastToMarkdown } from "../mdast-utils/mdast-to-markdown";
import { toTree } from "../parse";

describe("Sanitize fixtures", () => {
  const fixtures = readdirSync(path.join(__dirname, "fixtures"));

  for (const fixture of fixtures) {
    it(`Snapshot: ${fixture}`, async () => {
      const fixturePath = path.join(__dirname, "fixtures", fixture);
      const fixtureContents = readFileSync(fixturePath, "utf-8");
      const input = getFrontmatter(fixtureContents).content;
      const mdast = toTree(input).mdast;
      await expect(JSON.stringify(mdast, null, 2)).toMatchFileSnapshot(
        path.join(__dirname, "__snapshots__", fixture + ".mdast.json")
      );
      const output = mdastToMarkdown(mdast);
      await expect(output).toMatchFileSnapshot(
        path.join(__dirname, "__snapshots__", fixture)
      );
    });
  }
});
