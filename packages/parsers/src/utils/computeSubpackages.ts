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
    endpoint.namespace?.forEach((subpackage) => {
      const qualifiedSubpackagePath = [...qualifiedPath, subpackage];
      const fullyQualifiedSubpackageId = FernRegistry.api.v1.SubpackageId(
        qualifiedSubpackagePath.join(".")
      );
      subpackages[fullyQualifiedSubpackageId] = {
        id: fullyQualifiedSubpackageId,
        name: subpackage,
        displayName: titleCase(subpackage),
      };
      qualifiedPath.push(subpackage);
    });
  });

  return subpackages;
}
