import { APIV1Db } from "@fern-api/fdr-sdk";
import { PrismaClient } from "@prisma/client";

export interface DatabaseService {
    readonly prisma: PrismaClient;

    getApiDefinition(id: string): Promise<APIV1Db.DbApiDefinition | null>;

    markIndexForDeletion(indexId: string): Promise<void>;
}

export class DatabaseServiceImpl implements DatabaseService {
    public constructor(public readonly prisma: PrismaClient) {}

    public async getApiDefinition(id: string) {
        const record = await this.prisma.apiDefinitionsV2.findFirst({
            where: {
                apiDefinitionId: id,
            },
        });
        if (!record) {
            return null;
        }
        try {
            return JSON.parse(record.definition.toString()) as APIV1Db.DbApiDefinition;
        } catch {
            return null;
        }
    }

    public async markIndexForDeletion(indexId: string) {
        await this.prisma.overwrittenAlgoliaIndex.create({
            data: { indexId },
        });
    }
}
