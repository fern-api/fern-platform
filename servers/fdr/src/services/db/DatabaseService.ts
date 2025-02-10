import { PrismaClient } from "@prisma/client";

import { APIV1Db, FdrAPI } from "@fern-api/fdr-sdk";

export interface DatabaseService {
  readonly prisma: PrismaClient;

  getApiDefinition(id: string): Promise<APIV1Db.DbApiDefinition | null>;

  getApiLatestDefinition(
    id: string
  ): Promise<FdrAPI.api.latest.ApiDefinition | null>;

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
      return JSON.parse(
        record.definition.toString()
      ) as APIV1Db.DbApiDefinition;
    } catch {
      return null;
    }
  }

  public async getApiLatestDefinition(id: string) {
    const record = await this.prisma.apiDefinitionsLatest.findFirst({
      where: {
        apiDefinitionId: id,
      },
    });
    if (!record) {
      return null;
    }
    try {
      return JSON.parse(
        record.definition.toString()
      ) as FdrAPI.api.latest.ApiDefinition;
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
