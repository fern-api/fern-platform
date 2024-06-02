import fs from "fs";
import path from "path";
import { DocsV2Read } from "../../client";
import { convertLoadDocsForUrlResponse, findNode } from "../utils";
import { testGetAllUrlsFromDocsConfig } from "./testGetAllUrlsFromDocsConfig";

describe("getAllUrlsFromDocsConfig", () => {
    testGetAllUrlsFromDocsConfig("primer");
});

describe("getNavigationRoot", () => {
    describe("primer", () => {
        it("gets navigation root for /docs/api/introduction/getting-started", async () => {
            const fixturePath = path.join(__dirname, "fixtures", "primer.json");

            const content = fs.readFileSync(fixturePath, "utf-8");

            const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;

            const node = convertLoadDocsForUrlResponse(fixture);
            const meta = findNode(node, "docs/api/introduction/getting-started".split("/"));

            expect(meta.type === "found" ? meta.versions : []).toMatchSnapshot();
            expect(meta.type === "found" ? meta.currentVersion?.versionId : undefined).equal("v2.3");
        });

        it("gets navigation root for /docs/api/v2.1/api-reference/client-session-api/retrieve-client-side-token", async () => {
            const fixturePath = path.join(__dirname, "fixtures", "primer.json");

            const content = fs.readFileSync(fixturePath, "utf-8");

            const fixture = JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;

            const node = convertLoadDocsForUrlResponse(fixture);
            const meta = findNode(
                node,
                "docs/api/v2.1/api-reference/client-session-api/retrieve-client-side-token".split("/"),
            );

            expect(meta.type === "found" ? meta.versions : []).toMatchSnapshot();
            expect(meta.type === "found" ? meta.currentVersion?.versionId : undefined).equal("v2.1");
        });
    });
});
