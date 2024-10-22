import { readFileSync, readdirSync } from "fs";
import path from "path";
import { getFrontmatter } from "../frontmatter.js";
import { mdastToMarkdown, toTree } from "../parse.js";

describe("Sanitize fixtures", () => {
    const fixtures = readdirSync(path.join(__dirname, "fixtures"));

    for (const fixture of fixtures) {
        it(`Snapshot: ${fixture}`, () => {
            const fixturePath = path.join(__dirname, "fixtures", fixture);
            const fixtureContents = readFileSync(fixturePath, "utf-8");
            const input = getFrontmatter(fixtureContents).content;
            const output = mdastToMarkdown(toTree(input).mdast);
            expect(output).toMatchFileSnapshot(path.join(__dirname, "__snapshots__", fixture));
        });
    }
});
