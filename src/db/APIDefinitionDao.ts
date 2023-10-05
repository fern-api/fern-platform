import { Prisma, PrismaClient } from "@prisma/client";
import { APIV1Db } from "../api";
import { readBuffer } from "../util";

export interface ApiInfo {
    orgId: string;
    apiName: string;
}

export interface LoadAPIInfosRequest {
    orgIds?: string[];
    apiNames?: string[];
}

export interface APIDefinitionDao {
    loadAPIDefinition(apiDefinitionId: string): Promise<APIV1Db.DbApiDefinition | undefined>;

    loadAPIDefinitions(apiDefinitionIds: string[]): Promise<Record<string, APIV1Db.DbApiDefinition>>;

    loadAPIInfos({ loadAPIInfosRequest }: { loadAPIInfosRequest: LoadAPIInfosRequest }): Promise<ApiInfo[]>;
}

export class APIDefinitionDaoImpl implements APIDefinitionDao {
    constructor(private readonly prisma: PrismaClient) {}

    public async loadAPIDefinition(apiDefinitionId: string): Promise<APIV1Db.DbApiDefinition | undefined> {
        const apiDefinition = await this.prisma.apiDefinitionsV2.findFirst({
            where: {
                apiDefinitionId,
            },
        });
        if (apiDefinition == null) {
            return undefined;
        }
        return readBuffer(apiDefinition.definition) as APIV1Db.DbApiDefinition;
    }

    public async loadAPIDefinitions(apiDefinitionIds: string[]): Promise<Record<string, APIV1Db.DbApiDefinition>> {
        const apiDefinitions = await this.prisma.apiDefinitionsV2.findMany({
            where: {
                apiDefinitionId: {
                    in: Array.from(apiDefinitionIds),
                },
            },
        });
        return Object.fromEntries(
            apiDefinitions.map((apiDefinition) => {
                return [apiDefinition.apiDefinitionId, readBuffer(apiDefinition.definition) as APIV1Db.DbApiDefinition];
            })
        );
    }

    public async loadAPIInfos({
        loadAPIInfosRequest,
    }: {
        loadAPIInfosRequest: LoadAPIInfosRequest;
    }): Promise<ApiInfo[]> {
        const query: Prisma.ApiDefinitionsV2FindManyArgs = {
            where: {},
        };
        if (query.where != undefined) {
            if (loadAPIInfosRequest.apiNames !== undefined) {
                query.where.apiName = {
                    in: Array.from(loadAPIInfosRequest.apiNames),
                };
            }
            if (loadAPIInfosRequest.orgIds !== undefined) {
                query.where.orgId = {
                    in: Array.from(loadAPIInfosRequest.orgIds),
                };
            }
        }
        const dbApiRows = await this.prisma.apiDefinitionsV2.findMany(query);
        return dbApiRows.map((dbApiRow) => {
            return {
                orgId: dbApiRow.orgId,
                apiName: dbApiRow.apiName,
            };
        });
    }
}
