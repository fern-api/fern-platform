import { APIV1Read, APIV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { Prisma, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
    BadRequestError,
    EndpointSnippetTemplate,
    GetSnippetTemplate,
    RegisterSnippetTemplateBatchRequest,
    Sdk,
    SdkRequest,
    Template,
} from "../../api/generated/api";
import { WithoutQuestionMarks, readBuffer, writeBuffer } from "../../util";
import { SdkDaoImpl, SdkPackage } from "../sdk/SdkDao";
import { SdkIdFactory } from "./SdkIdFactory";
import {
    getLanguageFromRequest,
    getPackageNameFromSdkRequest,
    getSdkFromSdkRequest,
} from "./getPackageNameFromSdkSnippetsCreate";

export interface LoadSnippetAPIRequest {
    orgId: string;
    apiName: string;
}

export interface LoadSnippetAPIsRequest {
    orgIds: string[];
    apiName: string | undefined;
}

export type SnippetTemplatesByEndpoint = Record<
    FdrAPI.EndpointPath,
    Record<FdrAPI.EndpointMethod, APIV1Read.EndpointSnippetTemplates>
>;

export type SnippetTemplatesByEndpointIdentifier = Record<string, APIV1Read.EndpointSnippetTemplates>;

export interface SnippetTemplateDao {
    loadSnippetTemplate({
        loadSnippetTemplateRequest,
    }: {
        loadSnippetTemplateRequest: GetSnippetTemplate;
    }): Promise<EndpointSnippetTemplate | null>;

    loadSnippetTemplatesByEndpoint(opts: {
        orgId: FdrAPI.OrgId;
        apiId: FdrAPI.ApiId;
        sdkRequests: SdkRequest[];
        definition: APIV1Write.ApiDefinition;
    }): Promise<SnippetTemplatesByEndpoint>;

    loadSnippetTemplatesByEndpointIdentifier(opts: {
        orgId: FdrAPI.OrgId;
        apiId: FdrAPI.ApiId;
        sdkRequests: SdkRequest[];
        definition: APIV1Write.ApiDefinition;
    }): Promise<SnippetTemplatesByEndpointIdentifier>;

    storeSnippetTemplate({
        storeSnippetsInfo,
    }: {
        storeSnippetsInfo: RegisterSnippetTemplateBatchRequest;
    }): Promise<void>;
}

export class SnippetTemplateDaoImpl implements SnippetTemplateDao {
    constructor(private readonly prisma: PrismaClient) {}
    async loadSnippetTemplatesByEndpointIdentifier({
        orgId,
        apiId,
        sdkRequests,
        definition,
    }: {
        orgId: string;
        apiId: string;
        sdkRequests: SdkRequest[];
        definition: APIV1Write.ApiDefinition;
    }): Promise<SnippetTemplatesByEndpointIdentifier> {
        const endpoints: APIV1Write.EndpointDefinition[] = [];
        for (const endpoint of definition.rootPackage.endpoints) {
            endpoints.push(endpoint);
        }

        for (const subpackage of Object.values(definition.subpackages)) {
            for (const endpoint of subpackage.endpoints) {
                endpoints.push(endpoint);
            }
        }

        const toRet: Record<string, APIV1Read.EndpointSnippetTemplates> = {};
        for (const endpoint of endpoints) {
            for (const sdk of sdkRequests) {
                if (sdk.type !== "typescript" && sdk.type !== "python") {
                    continue;
                }
                const result = await this.loadSnippetTemplate({
                    loadSnippetTemplateRequest: {
                        sdk,
                        orgId,
                        apiId,
                        endpointId: {
                            path: getEndpointPathAsString(endpoint),
                            method: endpoint.method,
                        },
                    },
                });
                if (result != null && result.endpointId.identifierOverride != null) {
                    if (toRet[result.endpointId.identifierOverride] == null) {
                        toRet[result.endpointId.identifierOverride] = {};
                    }
                    toRet[result.endpointId.identifierOverride][sdk.type] = result.snippetTemplate;
                }
            }
        }

        return toRet;
    }

    async getSdkFromSdkRequest(request: SdkRequest): Promise<Sdk> {
        if (request.version != null) {
            return { ...request, version: request.version };
        } else {
            const packageName = getPackageNameFromSdkRequest(request);
            const language = getLanguageFromRequest({ sdk: request });
            const sdkDao = await this.prisma.sdk.findFirst({
                select: {
                    version: true,
                },
                where: {
                    // package: packageName,
                    language,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            if (sdkDao == null) {
                throw new BadRequestError(`No SDK found for the given request: ${language} ${packageName}`);
            } else if (sdkDao.version == null) {
                throw new BadRequestError("No version for SDK found for the given request");
            }

            return {
                ...request,
                version: sdkDao.version,
            };
        }
    }

    public async loadSnippetTemplate({
        loadSnippetTemplateRequest,
    }: {
        loadSnippetTemplateRequest: GetSnippetTemplate;
    }): Promise<EndpointSnippetTemplate | null> {
        const sdkFromRequest = await getSdkFromSdkRequest(this.prisma, loadSnippetTemplateRequest.sdk);

        let snippetTemplate = null;
        if (loadSnippetTemplateRequest.endpointId.identifierOverride != null) {
            snippetTemplate = await this.prisma.snippetTemplate.findFirst({
                where: {
                    orgId: loadSnippetTemplateRequest.orgId,
                    apiName: loadSnippetTemplateRequest.apiId,
                    identifierOverride: loadSnippetTemplateRequest.endpointId.identifierOverride,
                    sdkId: this.getSdkId(sdkFromRequest),
                },
            });
        }
        if (snippetTemplate == null) {
            snippetTemplate = await this.prisma.snippetTemplate.findFirst({
                where: {
                    orgId: loadSnippetTemplateRequest.orgId,
                    apiName: loadSnippetTemplateRequest.apiId,
                    endpointPath: loadSnippetTemplateRequest.endpointId?.path,
                    endpointMethod: loadSnippetTemplateRequest.endpointId?.method,
                    sdkId: this.getSdkId(sdkFromRequest),
                },
            });
        }

        if (!snippetTemplate) {
            return null;
        }
        return {
            endpointId: {
                path: snippetTemplate.endpointPath,
                method: snippetTemplate.endpointMethod,
                identifierOverride: snippetTemplate.identifierOverride ?? undefined,
            },
            sdk: sdkFromRequest,
            snippetTemplate: {
                type: snippetTemplate.version,
                functionInvocation: readBuffer(snippetTemplate.functionInvocation) as Template,
                clientInstantiation: readBuffer(snippetTemplate.clientInstantiation) as string,
            },
        };
    }

    private getSdkId(sdk: Sdk): string {
        switch (sdk.type) {
            case "typescript":
                return SdkIdFactory.fromTypescript(sdk);
            case "python":
                return SdkIdFactory.fromPython(sdk);
            case "go":
                return SdkIdFactory.fromGo(sdk);
            case "ruby":
                return SdkIdFactory.fromRuby(sdk);
            case "java":
                return SdkIdFactory.fromJava(sdk);
        }
    }

    public async storeSnippetTemplate({
        storeSnippetsInfo,
    }: {
        storeSnippetsInfo: RegisterSnippetTemplateBatchRequest;
    }): Promise<void> {
        const dbApi = await this.prisma.snippetApi.findUnique({
            where: {
                orgId_apiName: {
                    orgId: storeSnippetsInfo.orgId,
                    apiName: storeSnippetsInfo.apiId,
                },
            },
        });
        if (dbApi == null) {
            await this.prisma.snippetApi.create({
                data: {
                    orgId: storeSnippetsInfo.orgId,
                    apiName: storeSnippetsInfo.apiId,
                },
            });
        }
        const sdkDao = new SdkDaoImpl(this.prisma);

        await this.prisma.$transaction(async (tx) => {
            const snippets: Prisma.Enumerable<WithoutQuestionMarks<Prisma.SnippetTemplateCreateManyInput>> = [];
            const sdks: Prisma.Enumerable<SdkPackage> = [];
            storeSnippetsInfo.snippets.map(async (snippet) => {
                const sdkId = this.getSdkId(snippet.sdk);

                snippets.push({
                    id: uuidv4(),
                    orgId: storeSnippetsInfo.orgId,
                    apiName: storeSnippetsInfo.apiId,
                    apiDefinitionId: storeSnippetsInfo.apiDefinitionId,
                    endpointPath: snippet.endpointId.path,
                    endpointMethod: snippet.endpointId.method,
                    identifierOverride: snippet.endpointId.identifierOverride,
                    sdkId,
                    version: snippet.snippetTemplate.type,
                    functionInvocation: writeBuffer(snippet.snippetTemplate.functionInvocation),
                    clientInstantiation: writeBuffer(snippet.snippetTemplate.clientInstantiation),
                });

                sdks.push({
                    id: sdkId,
                    sdkPackage: getPackageNameFromSdkRequest(snippet.sdk),
                    version: snippet.sdk.version,
                    language: getLanguageFromRequest({ sdk: snippet.sdk }),
                    sdk: writeBuffer(snippet.sdk),
                });
            });

            await sdkDao.createManySdks(sdks, tx);
            await tx.snippetTemplate.createMany({
                data: snippets,
            });
        });
    }

    public async loadSnippetTemplatesByEndpoint({
        orgId,
        apiId,
        sdkRequests,
        definition,
    }: {
        orgId: string;
        apiId: string;
        sdkRequests: SdkRequest[];
        definition: APIV1Write.ApiDefinition;
    }): Promise<Record<FdrAPI.EndpointPath, Record<FdrAPI.EndpointMethod, APIV1Read.EndpointSnippetTemplates>>> {
        const endpoints: APIV1Write.EndpointDefinition[] = [];
        for (const endpoint of definition.rootPackage.endpoints) {
            endpoints.push(endpoint);
        }

        for (const subpackage of Object.values(definition.subpackages)) {
            for (const endpoint of subpackage.endpoints) {
                endpoints.push(endpoint);
            }
        }

        const toRet: Record<
            FdrAPI.EndpointPath,
            Record<FdrAPI.EndpointMethod, APIV1Read.EndpointSnippetTemplates>
        > = {};
        for (const endpoint of endpoints) {
            for (const sdk of sdkRequests) {
                if (sdk.type !== "typescript" && sdk.type !== "python") {
                    continue;
                }
                const result = await this.loadSnippetTemplate({
                    loadSnippetTemplateRequest: {
                        sdk,
                        orgId,
                        apiId,
                        endpointId: {
                            path: getEndpointPathAsString(endpoint),
                            method: endpoint.method,
                        },
                    },
                });
                if (result != null) {
                    if (toRet[result.endpointId.path] == null) {
                        toRet[result.endpointId.path] = {
                            PATCH: {},
                            POST: {},
                            PUT: {},
                            GET: {},
                            DELETE: {},
                        };
                    }
                    toRet[result.endpointId.path][result.endpointId.method][sdk.type] = result.snippetTemplate;
                }
            }
        }

        return toRet;
    }
}

function getEndpointPathAsString(endpoint: APIV1Write.EndpointDefinition) {
    let endpointPath = "";
    for (const part of endpoint.path.parts) {
        if (part.type === "literal") {
            endpointPath += `${part.value}`;
        } else {
            endpointPath += `{${part.value}}`;
        }
    }
    return endpointPath;
}
