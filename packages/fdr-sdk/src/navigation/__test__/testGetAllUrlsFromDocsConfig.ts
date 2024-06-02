import fs from "fs";
import path from "path";
import { DocsV2Read } from "../../client";
import { NodeCollector } from "../NodeCollector";
import { convertLoadDocsForUrlResponse } from "../utils";

export function testGetAllUrlsFromDocsConfig(fixtureName: string): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("gets all urls from docs config", async () => {
            const fixturePath = path.join(__dirname, "fixtures", `${fixtureName}.json`);

            const content = fs.readFileSync(fixturePath, "utf-8");

            const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;

            const node = convertLoadDocsForUrlResponse(fixture);
            const slugCollector = NodeCollector.collect(node);
            const urls = slugCollector.getPageSlugs();

            expect(urls).toMatchSnapshot();
        });
    });
}
