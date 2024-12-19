import { OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "../../3.1/guards/isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveWebhookReference(
    operationItem: OpenAPIV3_1.PathItemObject | OpenAPIV3_1.ReferenceObject,
    document: OpenAPIV3_1.Document
): OpenAPIV3_1.PathItemObject | undefined {
    if (isReferenceObject(operationItem)) {
        const resolved = resolveReference<
            OpenAPIV3_1.PathItemObject | undefined
        >(operationItem, document, undefined);
        if (resolved == null) {
            return undefined;
        }
        return {
            ...resolved,
            ...operationItem,
        } as OpenAPIV3_1.OperationObject;
    }

    return operationItem;
}
