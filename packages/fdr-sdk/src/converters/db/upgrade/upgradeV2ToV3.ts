import { mapValues } from "es-toolkit/object";

import { DocsV1Db } from "../../../client";

export function upgradeV2ToV3(
  v2: DocsV1Db.DocsDefinitionDb.V2
): DocsV1Db.DocsDefinitionDb.V3 {
  return {
    type: "v3",
    pages: v2.pages,
    referencedApis: v2.referencedApis,
    files: mapValues(
      v2.files,
      (file): DocsV1Db.DbFileInfoV2 => ({
        type: "s3Key",
        s3Key: file.s3Key,
      })
    ),
    config: v2.config,
    jsFiles: undefined,
  };
}
