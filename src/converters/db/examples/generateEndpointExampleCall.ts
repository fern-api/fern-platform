/* eslint-disable @typescript-eslint/no-base-to-string */
import { APIV1Write } from "../../../api";
import { LOGGER } from "../../../app/FdrApplication";
import { assertNever } from "../../../util";
import {
    generateExampleFromTypeReference,
    generateHttpRequestBodyExample,
    generateHttpResponseBodyExample,
} from "./generateHttpBodyExample";

const MAX_OPTIONAL_EXAMPLES_FOR_QUERY_PARAMS = 2;

/**
 * If `error` is provided, generates an example for an unsuccessful request with the specified error type.
 * Otherwise generates an example for a successful request.
 */
export function generateEndpointExampleCall(
    endpointDefinition: APIV1Write.EndpointDefinition,
    apiDefinition: APIV1Write.ApiDefinition,
    error?: APIV1Write.ErrorDeclaration
): APIV1Write.ExampleEndpointCall {
    try {
        const resolveTypeById = (typeId: APIV1Write.TypeId): APIV1Write.TypeDefinition => {
            const typeDefinition = apiDefinition.types[typeId];
            if (typeDefinition == null) {
                throw new Error(`Failed to find ${typeId}`);
            }
            return typeDefinition;
        };
        const exampleQueryParameters: Record<string, unknown> = {};
        let optionalCount = 0;
        for (const queryParameter of endpointDefinition.queryParameters) {
            const value = generateExampleFromTypeReference(
                queryParameter.type,
                resolveTypeById,
                optionalCount >= MAX_OPTIONAL_EXAMPLES_FOR_QUERY_PARAMS,
                new Set(),
                0
            );
            if (queryParameter.type.type === "optional") {
                optionalCount += 1;
            }
            exampleQueryParameters[queryParameter.key] = value;
        }
        const exampleEndpointCall: Omit<APIV1Write.ExampleEndpointCall, "path"> = {
            pathParameters: endpointDefinition.path.pathParameters.reduce((acc, pathParameter) => {
                const isString = isTypeReferenceString({
                    typeReference: pathParameter.type,
                    types: apiDefinition.types,
                });
                return {
                    ...acc,
                    [pathParameter.key]: isString
                        ? `:${pathParameter.key}`
                        : generateExampleFromTypeReference(pathParameter.type, resolveTypeById, false, new Set(), 0),
                };
            }, {}),
            queryParameters: exampleQueryParameters,
            headers: endpointDefinition.headers.reduce((acc, header) => {
                const value = generateExampleFromTypeReference(header.type, resolveTypeById, false, new Set(), 0);
                if (value == null) {
                    return acc;
                }
                return {
                    ...acc,
                    [header.key]: value,
                };
            }, {}),
            requestBody:
                endpointDefinition.request != null
                    ? generateHttpRequestBodyExample(endpointDefinition.request.type, resolveTypeById)
                    : undefined,
            responseStatusCode: error == null ? 200 : error.statusCode,
            responseBody:
                endpointDefinition.response != null && error == null
                    ? generateHttpResponseBodyExample(endpointDefinition.response.type, resolveTypeById)
                    : error?.type != null
                    ? generateExampleFromTypeReference(error.type, resolveTypeById, false, new Set(), 0)
                    : undefined,
        };
        return {
            path: generatePath(endpointDefinition.path, exampleEndpointCall.pathParameters),
            ...exampleEndpointCall,
        };
    } catch (e) {
        LOGGER.error(`Failed to generate example for endpoint ${endpointDefinition.id}`, e);
        throw new APIV1Write.EndpointExampleGenerationError({ endpointId: endpointDefinition.id });
    }
}

function generatePath(path: APIV1Write.EndpointPath, pathParameters: Record<string, unknown>): string {
    let pathString = "";
    for (const part of path.parts) {
        switch (part.type) {
            case "literal":
                pathString += part.value;
                break;
            case "pathParameter":
                {
                    const value = pathParameters[part.value];
                    if (value == null) {
                        throw new Error("Path parameter is missing: " + part.value);
                    }
                    pathString += value;
                }
                break;
            default:
                assertNever(part);
        }
    }
    return pathString;
}

function isTypeReferenceString({
    typeReference,
    types,
}: {
    typeReference: APIV1Write.TypeReference;
    types: Record<APIV1Write.TypeId, APIV1Write.TypeDefinition>;
}): boolean {
    if (typeReference.type === "primitive" && typeReference.value.type === "string") {
        return true;
    } else if (typeReference.type === "id") {
        const typeDef = types[typeReference.value];
        if (typeDef != null && typeDef.shape.type === "alias") {
            return isTypeReferenceString({ typeReference: typeDef.shape.value, types });
        }
    }
    return false;
}
