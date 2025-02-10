import fs from "fs";
import path from "path";

import { DocsV2Read } from "../client";

export function readFixture(fixture: string) {
  const fixturePath = path.join(__dirname, "fixtures", `${fixture}.json`);
  const content = fs.readFileSync(fixturePath, "utf-8");
  return JSON.parse(content) as DocsV2Read.LoadDocsForUrlResponse;
}
