import { Language, Prisma, PrismaClient } from "@prisma/client";
import { FernRegistry } from "src/api/generated";
import { v4 as uuidv4 } from "uuid";
import { FdrAPI } from "../api";
import { readBuffer, writeBuffer } from "../util";

const DEFAULT_SNIPPETS_PAGE_SIZE = 100;

export interface LoadSnippetsInfo {
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
    endpointIdentifier: FdrAPI.EndpointIdentifier;
    sdks?: FdrAPI.Sdk[];
    page?: number
}

export interface LoadSnippetsResponse {
    snippets: FdrAPI.Snippet[]
    nextPage: number
}

export interface StoreSnippetsInfo {
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
    sdk: FdrAPI.SdkSnippetsCreate
}

export interface StoreSnippetsResponse {
    sdkId: string;
}

export interface SdkInfo {
    id: string;
    language: Language;
}

export interface SnippetsDao {
    loadSnippets({
        loadSnippetsInfo,
    }: {
        loadSnippetsInfo: LoadSnippetsInfo;
    }): Promise<LoadSnippetsResponse>;

    storeSnippets({
        storeSnippetsInfo,
    }: {
        storeSnippetsInfo: StoreSnippetsInfo;
    }): Promise<StoreSnippetsResponse>;
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
            const query: Prisma.SnippetFindManyArgs = {
                where: {
                    orgId: loadSnippetsInfo.orgId,
                    apiName: loadSnippetsInfo.apiId,
                    endpointPath: loadSnippetsInfo.endpointIdentifier.path,
                    endpointMethod: loadSnippetsInfo.endpointIdentifier.method,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: DEFAULT_SNIPPETS_PAGE_SIZE,
            };
            if (query.where != null && sdkIds !== undefined && sdkIds.length > 0) {
                query.where.sdkId = {
                    in: Array.from(sdkIds)
                };
            }
            if (loadSnippetsInfo.page != null) {
                query.skip = (loadSnippetsInfo.page - 1) * DEFAULT_SNIPPETS_PAGE_SIZE;
            }
            const snippetDbRow = await tx.snippet.findMany(query);
            const snippets: FdrAPI.Snippet[] = await Promise.all(
                snippetDbRow.map(async (snippet) => {
                    const dbSdk = await tx.sdk.findUniqueOrThrow({
                        where: {
                            id: snippet.sdkId,
                        },
                    });
                    const sdk = readBuffer(dbSdk.sdk) as FernRegistry.Sdk;
                    switch (dbSdk.language) {
                        case Language.TYPESCRIPT:
                            return {
                                type: "typescript",
                                sdk: sdk as FernRegistry.TypeScriptSdk,
                                client: (readBuffer(snippet.snippet) as FdrAPI.TypeScriptSnippetCode).client,
                            }
                        case Language.PYTHON: {
                            const pythonSnippetCode: FdrAPI.PythonSnippetCode = readBuffer(snippet.snippet) as FdrAPI.PythonSnippetCode;
                            return {
                                type: "python",
                                sdk: sdk as FernRegistry.PythonSdk,
                                async_client: pythonSnippetCode.async_client,
                                sync_client: pythonSnippetCode.sync_client,
                            }
                        }
                        case Language.GO:
                            return {
                                type: "go",
                                sdk: sdk as FernRegistry.GoSdk,
                                client: (readBuffer(snippet.snippet) as FdrAPI.GoSnippetCode).client,
                            }
                        case Language.JAVA: {
                            const javaSnippetCode: FdrAPI.JavaSnippetCode = readBuffer(snippet.snippet) as FdrAPI.JavaSnippetCode;
                            return {
                                type: "java",
                                sdk: sdk as FernRegistry.JavaSdk,
                                async_client: javaSnippetCode.async_client,
                                sync_client: javaSnippetCode.sync_client,
                            }
                        }
                    }
                })
            );
            return {
                snippets: snippets,
                nextPage: (loadSnippetsInfo.page ?? 1) + 1,
            };
        });
    }

    public async storeSnippets({
        storeSnippetsInfo,
    }: {
        storeSnippetsInfo: StoreSnippetsInfo;
    }): Promise<StoreSnippetsResponse> {
        return await this.prisma.$transaction(async (tx) => {
            const sdkInfo = sdkInfoFromSnippetsCreate({
                sdkSnippetsCreate: storeSnippetsInfo.sdk,
            });
            const sdks = await tx.sdk.findUnique({
                where: {
                    id: sdkInfo.id,
                },
            });
            if (sdks !== null) {
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
                snippets.push(
                    {
                        id: uuidv4(),
                        orgId: storeSnippetsInfo.orgId,
                        apiName: storeSnippetsInfo.apiId,
                        endpointPath: snippet.endpoint.path,
                        endpointMethod: snippet.endpoint.method,
                        sdkId: sdkInfo.id,
                        snippet: writeBuffer(snippet.snippet),
                    },
                )
            });
            await tx.snippet.createMany({
                data: snippets,
            });
            return {
                sdkId: sdkInfo.id,
            }
        });
    }
}