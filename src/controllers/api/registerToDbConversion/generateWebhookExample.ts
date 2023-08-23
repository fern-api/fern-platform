import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";
import { generateWebhookPayloadExample } from "./generateHttpBodyExample";

export function generateWebhookExample({
    webhookDefinition,
    apiDefinition,
}: {
    webhookDefinition: ApiV1Write.WebhookDefinition;
    apiDefinition: ApiV1Write.ApiDefinition;
}): ApiV1Write.ExampleWebhookPayload {
    try {
        const resolveTypeById = (typeId: ApiV1Write.TypeId): ApiV1Write.TypeDefinition => {
            const typeDefinition = apiDefinition.types[typeId];
            if (typeDefinition == null) {
                throw new Error(`Failed to find ${typeId}`);
            }
            return typeDefinition;
        };
        return {
            payload: generateWebhookPayloadExample(webhookDefinition.payload.type, resolveTypeById),
        };
    } catch (e) {
        console.error(`Failed to generate example for webhook ${webhookDefinition.id}`, e);
        throw new ApiV1Write.EndpointExampleGenerationError({ endpointId: webhookDefinition.id });
    }
}
