import { Language, Prisma, PrismaClient, Sdk, Snippet } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { FdrAPI } from "../api";
import { readBuffer, writeBuffer } from "../util";
import { PrismaTransaction } from "./types";

export const DEFAULT_SNIPPETS_PAGE_SIZE = 100;

export interface LoadSnippetsInfo {
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
    endpointIdentifier: FdrAPI.EndpointIdentifier | undefined;
    sdks: FdrAPI.Sdk[] | undefined;
    page: number | undefined;
}

export interface LoadSnippetsResponse {
    snippets: Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod>;
    nextPage: number | undefined;
}

export interface StoreSnippetsInfo {
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
    sdk: FdrAPI.SdkSnippetsCreate;
}

export interface StoreSnippetsResponse {
    sdkId: string;
}

export interface SdkInfo {
    id: string;
    language: Language;
}

export interface SnippetsDao {
    loadSnippets({ loadSnippetsInfo }: { loadSnippetsInfo: LoadSnippetsInfo }): Promise<LoadSnippetsResponse>;

    storeSnippets({ storeSnippetsInfo }: { storeSnippetsInfo: StoreSnippetsInfo }): Promise<StoreSnippetsResponse>;
}

function sdkInfoFromSnippetsCreate({ sdkSnippetsCreate }: { sdkSnippetsCreate: FdrAPI.SdkSnippetsCreate }): SdkInfo {
    switch (sdkSnippetsCreate.type) {
        case "typescript":
            return {
                language: Language.TYPESCRIPT,
                id: sdkIdFromTypescriptSdk({
                    sdk: sdkSnippetsCreate.sdk,
                }),
            };
        case "python":
            return {
                language: Language.PYTHON,
                id: sdkIdFromPythonSdk({
                    sdk: sdkSnippetsCreate.sdk,
                }),
            };
        case "go":
            return {
                language: Language.GO,
                id: sdkIdFromGoSdk({
                    sdk: sdkSnippetsCreate.sdk,
                }),
            };
        case "java":
            return {
                language: Language.JAVA,
                id: sdkIdFromJavaSdk({
                    sdk: sdkSnippetsCreate.sdk,
                }),
            };
    }
}

function sdkInfoFromSdk({ sdk }: { sdk: FdrAPI.Sdk }): SdkInfo {
    switch (sdk.type) {
        case "typescript":
            return {
                language: Language.TYPESCRIPT,
                id: sdkIdFromTypescriptSdk({
                    sdk: sdk,
                }),
            };
        case "python":
            return {
                language: Language.PYTHON,
                id: sdkIdFromPythonSdk({
                    sdk: sdk,
                }),
            };
        case "go":
            return {
                language: Language.GO,
                id: sdkIdFromGoSdk({
                    sdk: sdk,
                }),
            };
        case "java":
            return {
                language: Language.JAVA,
                id: sdkIdFromJavaSdk({
                    sdk: sdk,
                }),
            };
    }
}

function sdkIdFromTypescriptSdk({ sdk }: { sdk: FdrAPI.TypeScriptSdk }): string {
    return `typescript|${sdk.package}|${sdk.version}`;
}

function sdkIdFromPythonSdk({ sdk }: { sdk: FdrAPI.PythonSdk }): string {
    return `python|${sdk.package}|${sdk.version}`;
}

function sdkIdFromGoSdk({ sdk }: { sdk: FdrAPI.GoSdk }): string {
    return `go|${sdk.githubRepo}|${sdk.version}`;
}

function sdkIdFromJavaSdk({ sdk }: { sdk: FdrAPI.JavaSdk }): string {
    return `java|${sdk.group}|${sdk.artifact}|${sdk.version}`;
}

function convertSnippetFromDb({ dbSdkRow, dbSnippet }: { dbSdkRow: Sdk; dbSnippet: Snippet }): FdrAPI.Snippet {
    const sdk = readBuffer(dbSdkRow.sdk) as FdrAPI.Sdk;
    switch (dbSdkRow.language) {
        case Language.TYPESCRIPT:
            return {
                type: "typescript",
                sdk: sdk as FdrAPI.TypeScriptSdk,
                client: (readBuffer(dbSnippet.snippet) as FdrAPI.TypeScriptSnippetCode).client,
            };
        case Language.PYTHON: {
            const pythonSnippetCode: FdrAPI.PythonSnippetCode = readBuffer(
                dbSnippet.snippet
            ) as FdrAPI.PythonSnippetCode;
            return {
                type: "python",
                sdk: sdk as FdrAPI.PythonSdk,
                async_client: pythonSnippetCode.async_client,
                sync_client: pythonSnippetCode.sync_client,
            };
        }
        case Language.GO:
            return {
                type: "go",
                sdk: sdk as FdrAPI.GoSdk,
                client: (readBuffer(dbSnippet.snippet) as FdrAPI.GoSnippetCode).client,
            };
        case Language.JAVA: {
            const javaSnippetCode: FdrAPI.JavaSnippetCode = readBuffer(dbSnippet.snippet) as FdrAPI.JavaSnippetCode;
            return {
                type: "java",
                sdk: sdk as FdrAPI.JavaSdk,
                async_client: javaSnippetCode.async_client,
                sync_client: javaSnippetCode.sync_client,
            };
        }
    }
}

export class SnippetsDaoImpl implements SnippetsDao {
    constructor(private readonly prisma: PrismaClient) {}

    public async loadSnippets({
        loadSnippetsInfo,
    }: {
        loadSnippetsInfo: LoadSnippetsInfo;
    }): Promise<LoadSnippetsResponse> {
        return await this.prisma.$transaction(async (tx) => {
            const sdkIds: string[] | undefined = loadSnippetsInfo.sdks?.map((sdk: FdrAPI.Sdk) => {
                return sdkInfoFromSdk({
                    sdk: sdk,
                }).id;
            });

            const sdkIdsForSnippets =
                sdkIds != null ? sdkIds : await this.getSdkIdsReferencedBySnippetRows({ loadSnippetsInfo, tx });
            const dbSdkRows = await tx.sdk.findMany({
                where: {
                    id: {
                        in: sdkIdsForSnippets,
                    },
                },
            });
            const sdkIdToDbSdkRow = Object.fromEntries(dbSdkRows.map((dbSdkRow) => [dbSdkRow.id, dbSdkRow]));

            const loadSnippetsQuery: Prisma.SnippetFindManyArgs = {
                where: {
                    orgId: loadSnippetsInfo.orgId,
                    apiName: loadSnippetsInfo.apiId,
                    sdkId: {
                        in: sdkIds != null && sdkIds.length > 0 ? sdkIds : undefined,
                    },
                    endpointPath: loadSnippetsInfo.endpointIdentifier?.path,
                    endpointMethod: loadSnippetsInfo.endpointIdentifier?.method,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: DEFAULT_SNIPPETS_PAGE_SIZE,
                skip:
                    loadSnippetsInfo.page != null
                        ? (loadSnippetsInfo.page - 1) * DEFAULT_SNIPPETS_PAGE_SIZE
                        : undefined,
            };
            const snippetDbRows = await tx.snippet.findMany(loadSnippetsQuery);

            const endpointToSnippets: Record<FdrAPI.EndpointPath, FdrAPI.SnippetsByEndpointMethod> = {};

            for (const snippetDbRow of snippetDbRows) {
                const dbSdkRow = sdkIdToDbSdkRow[snippetDbRow.sdkId];
                if (dbSdkRow == null) {
                    throw new FdrAPI.InternalError(
                        `Internal error; SDK identified by ${snippetDbRow.sdkId} was not found`
                    );
                }
                const snippet: FdrAPI.Snippet = convertSnippetFromDb({
                    dbSdkRow,
                    dbSnippet: snippetDbRow,
                });
                if (endpointToSnippets[snippetDbRow.endpointPath] == null) {
                    endpointToSnippets[snippetDbRow.endpointPath] = {
                        PUT: [],
                        POST: [],
                        GET: [],
                        PATCH: [],
                        DELETE: [],
                    };
                }
                endpointToSnippets[snippetDbRow.endpointPath]?.[snippetDbRow.endpointMethod]?.push(snippet);
            }
            return {
                nextPage:
                    snippetDbRows.length === DEFAULT_SNIPPETS_PAGE_SIZE ? (loadSnippetsInfo.page ?? 1) + 1 : undefined,
                snippets: endpointToSnippets,
            };
        });
    }

    public async getSdkIdsReferencedBySnippetRows({
        tx,
        loadSnippetsInfo,
    }: {
        tx: PrismaTransaction;
        loadSnippetsInfo: LoadSnippetsInfo;
    }): Promise<string[]> {
        return (
            await tx.snippet.groupBy({
                by: ["sdkId"],
                where: {
                    orgId: loadSnippetsInfo.orgId,
                    apiName: loadSnippetsInfo.apiId,
                    endpointPath: loadSnippetsInfo.endpointIdentifier?.path,
                    endpointMethod: loadSnippetsInfo.endpointIdentifier?.method,
                },
            })
        ).map((row) => row.sdkId);
    }

    public async storeSnippets({
        storeSnippetsInfo,
    }: {
        storeSnippetsInfo: StoreSnippetsInfo;
    }): Promise<StoreSnippetsResponse> {
        return await this.prisma.$transaction(async (tx) => {
            const dbApi = await tx.snippetApi.findUnique({
                where: {
                    orgId_apiName: {
                        orgId: storeSnippetsInfo.orgId,
                        apiName: storeSnippetsInfo.apiId,
                    },
                },
            });
            if (dbApi === null) {
                await tx.snippetApi.create({
                    data: {
                        orgId: storeSnippetsInfo.orgId,
                        apiName: storeSnippetsInfo.apiId,
                    },
                });
            }
            const sdkInfo = sdkInfoFromSnippetsCreate({
                sdkSnippetsCreate: storeSnippetsInfo.sdk,
            });
            const dbSdk = await tx.sdk.findUnique({
                where: {
                    id: sdkInfo.id,
                },
            });
            if (dbSdk !== null) {
                // Overwrite the SDK and all of its snippets that already exist.
                await tx.sdk.delete({
                    where: {
                        id: sdkInfo.id,
                    },
                });
            }
            await tx.sdk.create({
                data: {
                    id: sdkInfo.id,
                    language: sdkInfo.language,
                    sdk: writeBuffer(storeSnippetsInfo.sdk.sdk),
                },
            });
            const snippets: Prisma.Enumerable<Prisma.SnippetCreateManyInput> = [];
            storeSnippetsInfo.sdk.snippets.map((snippet) => {
                snippets.push({
                    id: uuidv4(),
                    orgId: storeSnippetsInfo.orgId,
                    apiName: storeSnippetsInfo.apiId,
                    endpointPath: snippet.endpoint.path,
                    endpointMethod: snippet.endpoint.method,
                    sdkId: sdkInfo.id,
                    snippet: writeBuffer(snippet.snippet),
                });
            });
            await tx.snippet.createMany({
                data: snippets,
            });
            return {
                sdkId: sdkInfo.id,
            };
        });
    }
}
