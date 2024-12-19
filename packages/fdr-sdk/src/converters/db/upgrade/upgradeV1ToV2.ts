import { DocsV1Db } from "../../../client";

export function upgradeV1ToV2(
  v1: DocsV1Db.DocsDefinitionDb.V1
): DocsV1Db.DocsDefinitionDb.V2 {
  return { ...v1, type: "v2", typography: undefined };
}
