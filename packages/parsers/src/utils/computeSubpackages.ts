import { titleCase } from "@fern-api/ui-core-utils";
import { FernRegistry } from "../client/generated";

export declare namespace ComputeSubpackages {
  interface Args {
    endpoints?: Record<
      FernRegistry.EndpointId,
      FernRegistry.api.latest.EndpointDefinition
    >;
    webhookEndpoints?: Record<
      FernRegistry.EndpointId,
      FernRegistry.api.latest.WebhookDefinition
    >;
  }
}

export function computeSubpackages({
  endpoints,
  webhookEndpoints,
}: ComputeSubpackages.Args): Record<
  FernRegistry.api.v1.SubpackageId,
  FernRegistry.api.latest.SubpackageMetadata
> {
  const subpackages: Record<
    FernRegistry.api.v1.SubpackageId,
    FernRegistry.api.latest.SubpackageMetadata
  > = {};

  Object.values({
    ...endpoints,
    ...webhookEndpoints,
  }).forEach((endpoint) => {
    const qualifiedPath: string[] = [];
    return endpoint.namespace?.forEach((subpackage) => {
      const prunedSubpackage = subpackage.replace(/subpackage_/, "");
      const qualifiedSubpackagePath = [...qualifiedPath, prunedSubpackage];
      const fullyQualifiedSubpackageId = FernRegistry.api.v1.SubpackageId(
        `subpackage_${qualifiedSubpackagePath.join(".")}`
      );
      subpackages[fullyQualifiedSubpackageId] = {
        id: fullyQualifiedSubpackageId,
        name: qualifiedSubpackagePath.join("/"),
        displayName: titleCase(prunedSubpackage),
      };
      qualifiedPath.push(prunedSubpackage);
    });
  });

  return subpackages;
}
