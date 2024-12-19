import isPlainObject from "@fern-api/ui-core-utils/isPlainObject";
import { DocsV1Db } from "../../../client";
import { upgradeV1ToV2 } from "./upgradeV1ToV2";
import { upgradeV2ToV3 } from "./upgradeV2ToV3";

export function migrateDocsDbDefinition(
    buffer: unknown
): DocsV1Db.DocsDefinitionDb.V3 {
    if (!isPlainObject(buffer)) {
        throw new Error("Invalid buffer");
    }

    // default to v1, but this will be overwritten if dbValue has "type" defined
    let dbValue = {
        type: "v1",
        ...(buffer as object),
    } as DocsV1Db.DocsDefinitionDb;

    // TODO: refactor upgrade chaining to be more dynamic
    if (dbValue.type === "v1") {
        dbValue = upgradeV1ToV2(dbValue);
    }

    if (dbValue.type === "v2") {
        return upgradeV2ToV3(dbValue);
    }

    return dbValue as DocsV1Db.DocsDefinitionDb.V3;
}
