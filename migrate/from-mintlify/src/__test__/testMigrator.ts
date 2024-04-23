import fs from "fs";
import path from "path";
import { migrateMintlifyToDocsConfig } from "..";
import { MintJsonSchema } from "../mintlify";

export function testMigrator(fixtureName: string): void {
    // eslint-disable-next-line vitest/valid-title
    it("runs migrator", async () => {
        const fixturePath = path.join(__dirname, "fixtures", `${fixtureName}/mint.json`);

        const content = fs.readFileSync(fixturePath, "utf-8");

        const fixture = JSON.parse(content) as MintJsonSchema;

        const docsConfig = migrateMintlifyToDocsConfig(fixture);

        expect(docsConfig).toMatchSnapshot();
    });
}
