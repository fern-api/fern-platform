import { APIV1Write } from "../../../client";
import { generateWebhookPayloadExample } from "./generateHttpBodyExample";

export function generateWebhookExample({
    webhookDefinition,
    apiDefinition,
}: {
    webhookDefinition: APIV1Write.WebhookDefinition;
    apiDefinition: APIV1Write.ApiDefinition;
}): APIV1Write.ExampleWebhookPayload {
    try {
        const resolveTypeById = (
            typeId: APIV1Write.TypeId
        ): APIV1Write.TypeDefinition => {
            const typeDefinition = apiDefinition.types[typeId];
            if (typeDefinition == null) {
                throw new Error(`Failed to find ${typeId}`);
            }
            return typeDefinition;
        };
        return {
            payload: generateWebhookPayloadExample(
                webhookDefinition.payload.type,
                resolveTypeById
            ),
        };
    } catch (e) {
        throw new Error();
    }
}
