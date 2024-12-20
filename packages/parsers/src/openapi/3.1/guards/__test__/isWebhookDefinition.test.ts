import { FernRegistry } from "../../../client/generated";

export function isWebhookDefinition(
    definition: FernRegistry.api.latest.EndpointDefinition | FernRegistry.api.latest.WebhookDefinition,
): definition is FernRegistry.api.latest.WebhookDefinition {
    return "payload" in definition;
}
