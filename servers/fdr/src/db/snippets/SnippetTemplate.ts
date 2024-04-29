import { Prisma, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
    EndpointSnippetTemplate,
    GetSnippetTemplate,
    RegisterSnippetTemplateBatchRequest,
    Sdk,
    Template,
} from "../../api/generated/api";
import { readBuffer, writeBuffer } from "../../util";
import { SdkIdFactory } from "./SdkIdFactory";
import { getSdkFromSdkRequest } from "./getPackageNameFromSdkSnippetsCreate";

export interface LoadSnippetAPIRequest {
    orgId: string;
    apiName: string;
}

export interface LoadSnippetAPIsRequest {
    orgIds: string[];
    apiName: string | undefined;
}

export interface SnippetTemplateDao {
    loadSnippetTemplate({
        loadSnippetTemplateRequest,
    }: {
        loadSnippetTemplateRequest: GetSnippetTemplate;
    }): Promise<EndpointSnippetTemplate | null>;

    storeSnippetTemplate({
        storeSnippetsInfo,
    }: {
        storeSnippetsInfo: RegisterSnippetTemplateBatchRequest;
    }): Promise<void>;
}

export class SnippetTemplateDaoImpl implements SnippetTemplateDao {
    constructor(private readonly prisma: PrismaClient) {}

    public async loadSnippetTemplate({
        loadSnippetTemplateRequest,
    }: {
        loadSnippetTemplateRequest: GetSnippetTemplate;
    }): Promise<EndpointSnippetTemplate | null> {
        const sdkFromRequest = await getSdkFromSdkRequest(loadSnippetTemplateRequest.sdk);

        const snippetTemplate = await this.prisma.snippetTemplate.findFirst({
            where: {
                orgId: loadSnippetTemplateRequest.orgId,
                apiName: loadSnippetTemplateRequest.apiId,
                endpointPath: loadSnippetTemplateRequest.endpointId?.path,
                endpointMethod: loadSnippetTemplateRequest.endpointId?.method,
                sdkId: this.getSdkId(sdkFromRequest),
            },
        });

        if (!snippetTemplate) {
            return null;
        }
        return {
            endpointId: {
                path: snippetTemplate.endpointPath,
                method: snippetTemplate.endpointMethod,
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
        await this.prisma.$transaction(async (tx) => {
            const snippets: Prisma.Enumerable<Prisma.SnippetTemplateCreateManyInput> = [];
            storeSnippetsInfo.snippets.map((snippet) => {
                snippets.push({
                    id: uuidv4(),
                    orgId: storeSnippetsInfo.orgId,
                    apiName: storeSnippetsInfo.apiId,
                    apiDefinitionId: storeSnippetsInfo.apiDefinitionId,
                    endpointPath: snippet.endpointId.path,
                    endpointMethod: snippet.endpointId.method,
                    sdkId: this.getSdkId(snippet.sdk),
                    version: snippet.snippetTemplate.type,
                    functionInvocation: writeBuffer(snippet.snippetTemplate.functionInvocation),
                    clientInstantiation: writeBuffer(snippet.snippetTemplate.clientInstantiation),
                });
            });
            await tx.snippetTemplate.createMany({
                data: snippets,
            });
        });
    }
}
