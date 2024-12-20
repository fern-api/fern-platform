import { DocsV1Db, DocsV1Read } from "@fern-api/fdr-sdk";
import { FdrApplication } from "../app";

export async function getFilesV2(docsDbDefinition: DocsV1Db.DocsDefinitionDb, app: FdrApplication) {
    let promisedFiles: Promise<[DocsV1Read.FileId, DocsV1Read.File_]>[];
    if (docsDbDefinition.type === "v3") {
        promisedFiles = Object.entries(docsDbDefinition.files).map(
            async ([fileId, fileDbInfo]): Promise<[DocsV1Read.FileId, DocsV1Read.File_]> => {
                const s3DownloadUrl = await app.services.s3.getPresignedDocsAssetsDownloadUrl({
                    key: fileDbInfo.s3Key,
                    isPrivate: true, // for backcompat
                });
                const readFile: DocsV1Read.File_ =
                    fileDbInfo.type === "image"
                        ? {
                              type: "image",
                              url: s3DownloadUrl,
                              width: fileDbInfo.width,
                              height: fileDbInfo.height,
                              blurDataUrl: fileDbInfo.blurDataUrl,
                              alt: fileDbInfo.alt,
                          }
                        : { type: "url", url: s3DownloadUrl };
                return [DocsV1Read.FileId(fileId), readFile];
            },
        );
    } else {
        promisedFiles = Object.entries(docsDbDefinition.files).map(
            async ([fileId, fileDbInfo]): Promise<[DocsV1Read.FileId, DocsV1Read.File_]> => {
                const s3DownloadUrl = await app.services.s3.getPresignedDocsAssetsDownloadUrl({
                    key: fileDbInfo.s3Key,
                    isPrivate: true, // for backcompat
                });
                return [DocsV1Read.FileId(fileId), { type: "url", url: s3DownloadUrl }];
            },
        );
    }
    return Object.fromEntries(await Promise.all(promisedFiles));
}
