import { DefinitionRegistryService } from "@fern-fern/fern-definition-registry-api-server/services";

export const registryService = DefinitionRegistryService.expressMiddleware({
  draft: () => {
    throw new Error("Function not implemented.");
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
});
