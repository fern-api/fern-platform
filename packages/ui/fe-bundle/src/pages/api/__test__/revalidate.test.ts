import { LoadDocsForUrlResponse } from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { readFile } from "fs/promises";
import path from "path";
import { getUrlsToRevalidate } from "../revalidate";

const FIXTURES_DIR = path.join(__dirname, "fixtures");
const URL_RESPONSE_FILENAME = "urlResponse.json";

describe("revalidate", () => {
    testFixture("primer");
});

function testFixture(fixtureName: string) {
    describe(fixtureName, () => {
        it("Fails if API is not specified", async () => {
            const responseFilepath = path.join(FIXTURES_DIR, fixtureName, URL_RESPONSE_FILENAME);
            const response = JSON.parse((await readFile(responseFilepath)).toString()) as LoadDocsForUrlResponse;
            const pathsToRevalidate = getUrlsToRevalidate(response);
            expect(pathsToRevalidate).toMatchSnapshot();
        }, 90_000);
    });
}
