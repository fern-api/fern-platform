import { APIV1Db } from "@fern-api/fdr-sdk";
import { PrismaClient } from "@prisma/client";
import { readBuffer } from "../../util";

export interface APIDefinitionDao {
    getOrgIdForApiDefinition(apiDefinitionId: string): Promise<string | undefined>;

    loadAPIDefinition(apiDefinitionId: string): Promise<APIV1Db.DbApiDefinition | undefined>;

    loadAPIDefinitions(apiDefinitionIds: string[]): Promise<Record<string, APIV1Db.DbApiDefinition>>;
}

export class APIDefinitionDaoImpl implements APIDefinitionDao {
    constructor(private readonly prisma: PrismaClient) {}

    public async getOrgIdForApiDefinition(apiDefinitionId: string): Promise<string | undefined> {
        const apiDefinition = await this.prisma.apiDefinitionsV2.findFirst({
            where: {
                apiDefinitionId,
            },
            select: {
                orgId: true,
            },
        });
        return apiDefinition?.orgId;
    }

    public async loadAPIDefinition(apiDefinitionId: string): Promise<APIV1Db.DbApiDefinition | undefined> {
        const apiDefinition = await this.prisma.apiDefinitionsV2.findFirst({
            where: {
                apiDefinitionId,
            },
            select: {
                definition: true,
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
            select: {
                definition: true,
            },
        });
        return Object.fromEntries(
            apiDefinitions.map((apiDefinition) => {
                return [apiDefinition.apiDefinitionId, readBuffer(apiDefinition.definition) as APIV1Db.DbApiDefinition];
            }),
        );
    }
}
