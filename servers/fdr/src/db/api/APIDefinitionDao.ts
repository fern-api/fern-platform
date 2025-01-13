import { APIV1Db, FdrAPI } from "@fern-api/fdr-sdk";
import { PrismaClient } from "@prisma/client";
import { S3Service } from "../../services/s3";
import { readBuffer } from "../../util";
import { resolveLatestApiDefinition } from "../../util/resolveLatestApiDefinition";

export interface APIDefinitionDao {
  getOrgIdForApiDefinition(
    apiDefinitionId: string
  ): Promise<string | undefined>;

  loadAPIDefinition(
    apiDefinitionId: string
  ): Promise<APIV1Db.DbApiDefinition | undefined>;

  loadAPILatestDefinition(
    apiDefinitionId: string
  ): Promise<FdrAPI.api.latest.ApiDefinition | undefined>;

  loadAPIDefinitions(
    apiDefinitionIds: string[]
  ): Promise<Record<string, APIV1Db.DbApiDefinition>>;
}

export class APIDefinitionDaoImpl implements APIDefinitionDao {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly s3: S3Service
  ) {}

  public async getOrgIdForApiDefinition(
    apiDefinitionId: string
  ): Promise<string | undefined> {
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

  public async loadAPIDefinition(
    apiDefinitionId: string
  ): Promise<APIV1Db.DbApiDefinition | undefined> {
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

  public async loadAPILatestDefinition(
    apiDefinitionId: string
  ): Promise<FdrAPI.api.latest.ApiDefinition | undefined> {
    const apiDefinition = await this.prisma.apiDefinitionsLatest.findFirst({
      where: {
        apiDefinitionId,
      },
      select: {
        definition: true,
        s3Key: true,
      },
    });
    if (apiDefinition == null) {
      return undefined;
    }
    return resolveLatestApiDefinition(apiDefinition, this.s3);
  }

  public async loadAPIDefinitions(
    apiDefinitionIds: string[]
  ): Promise<Record<string, APIV1Db.DbApiDefinition>> {
    const apiDefinitions = await this.prisma.apiDefinitionsV2.findMany({
      where: {
        apiDefinitionId: {
          in: Array.from(apiDefinitionIds),
        },
      },
      select: {
        apiDefinitionId: true,
        definition: true,
      },
    });
    return Object.fromEntries(
      apiDefinitions.map((apiDefinition) => {
        return [
          apiDefinition.apiDefinitionId,
          readBuffer(apiDefinition.definition) as APIV1Db.DbApiDefinition,
        ];
      })
    );
  }
}
