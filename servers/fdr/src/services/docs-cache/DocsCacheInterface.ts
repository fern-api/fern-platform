import { DocsV1Db, DocsV1Read, DocsV2Read } from "../../api";

export interface CachedDocsResponse {
    updatedTime: Date;
    response: DocsV2Read.LoadDocsForUrlResponse;
    dbFiles: Record<DocsV1Read.FileId, DocsV1Db.DbFileInfo>;
    isPrivate: boolean;
}
