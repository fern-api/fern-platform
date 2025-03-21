import { mapValues } from "es-toolkit/object";

import { DocsV2Read } from "../../client";

export function toPages(docs: DocsV2Read.LoadDocsForUrlResponse) {
  return mapValues(docs.definition.pages, (page) => page.markdown);
}
