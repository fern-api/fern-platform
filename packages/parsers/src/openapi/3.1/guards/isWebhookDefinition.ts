import { FernRegistry } from "../../../client/generated";

export function isWebhookDefinition(
  definition:
    | FernRegistry.api.latest.EndpointDefinition
    | FernRegistry.api.latest.WebhookDefinition
): definition is FernRegistry.api.latest.WebhookDefinition {
  return "payloads" in definition && definition.payloads != null;
}
