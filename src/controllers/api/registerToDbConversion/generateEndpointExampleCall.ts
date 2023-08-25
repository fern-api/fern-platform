/* eslint-disable @typescript-eslint/no-base-to-string */
import { LOGGER } from "../../../app/FdrApplication";
import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";
import { EndpointExampleGenerationError } from "../../../generated/api/resources/api/resources/v1/resources/register/errors";
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
    endpointDefinition: ApiV1Write.EndpointDefinition,
    apiDefinition: ApiV1Write.ApiDefinition,
    error?: ApiV1Write.ErrorDeclaration
): ApiV1Write.ExampleEndpointCall {
    try {
        const resolveTypeById = (typeId: ApiV1Write.TypeId): ApiV1Write.TypeDefinition => {
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
        const exampleEndpointCall: Omit<ApiV1Write.ExampleEndpointCall, "path"> = {
            pathParameters: endpointDefinition.path.pathParameters.reduce(
                (acc, pathParameter) => ({
                    ...acc,
                    [pathParameter.key]: generateExampleFromTypeReference(
                        pathParameter.type,
                        resolveTypeById,
                        false,
                        new Set(),
                        0
                    ),
                }),
                {}
            ),
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
        throw new EndpointExampleGenerationError({ endpointId: endpointDefinition.id });
    }
}

function generatePath(path: ApiV1Write.EndpointPath, pathParameters: Record<string, unknown>): string {
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
