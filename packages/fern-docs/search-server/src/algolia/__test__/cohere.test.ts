import fs from "fs";
import path from "path";
import { createMarkdownRecords } from "../records/create-markdown-records";
import { BaseRecord } from "../types";

const base: BaseRecord = {
  objectID: "test",
  org_id: "test",
  domain: "test",
  canonicalPathname: "/test",
  pathname: "/test",
  title: "test",
  breadcrumb: [],
  visible_by: [],
  authed: false,
};

describe("cohere", () => {
  it("should work", () => {
    const fixture = fs.readFileSync(
      path.join(__dirname, "fixtures/cohere.mdx"),
      "utf8"
    );
    const result = createMarkdownRecords({
      base,
      markdown: fixture,
    });

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      path.join(__dirname, "__snapshots__/cohere.json")
    );
  });
});
