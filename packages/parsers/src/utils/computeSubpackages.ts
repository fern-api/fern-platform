import { camelCase } from "es-toolkit";

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

  if (endpoints != null) {
    Object.values(endpoints).forEach((endpoint) =>
      endpoint.namespace?.forEach((subpackage) => {
        const qualifiedPath: string[] = [];
        subpackages[FernRegistry.api.v1.SubpackageId(camelCase(subpackage))] = {
          id: FernRegistry.api.v1.SubpackageId(camelCase(subpackage)),
          name: [...qualifiedPath, subpackage].join("/"),
          displayName: subpackage,
        };
        qualifiedPath.push(subpackage);
      })
    );
  }

  if (webhookEndpoints != null) {
    Object.values(webhookEndpoints).forEach((webhook) =>
      webhook.namespace?.forEach((subpackage) => {
        const qualifiedPath: string[] = [];
        subpackages[FernRegistry.api.v1.SubpackageId(camelCase(subpackage))] = {
          id: FernRegistry.api.v1.SubpackageId(camelCase(subpackage)),
          name: [...qualifiedPath, subpackage].join("/"),
          displayName: subpackage,
        };
        qualifiedPath.push(subpackage);
      })
    );
  }

  return subpackages;
}
