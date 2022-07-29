import { ApiVersion } from "@fern-fern/fern-definition-registry-api-server/model";
import { DefinitionRegistryService } from "@fern-fern/fern-definition-registry-api-server/services";
import { PrismaClient } from "@prisma/client";
import { updateOrCreateApi } from "../db/apiDao";

export function getRegistryService(
  prisma: PrismaClient
): DefinitionRegistryService {
  return {
    draft: async (request) => {
      const response = await updateOrCreateApi(
        {
          apiId: request.apiName,
          orgName: request.organization,
        },
        prisma
      );
      return {
        ok: true,
        body: {
          apiVersion: ApiVersion.of(response.version),
          taskIds: [],
        },
      };
    },
    promote: () => {
      throw new Error("Function not implemented.");
    },
    release: () => {
      throw new Error("Function not implemented.");
    },
    getVersions: () => {
      throw new Error("Function not implemented.");
    },
  };
}
