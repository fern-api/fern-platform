/* eslint-disable no-case-declarations */
import { assertNever } from "../../../assertNever";
import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";
import {
    generateExampleFromTypeReference,
    generateHttpRequestBodyExample,
    generateHttpResponseBodyExample,
} from "./generateHttpBodyExample";

export function generateDummyEndpointExampleCall(
    endpointDefinition: ApiV1Write.EndpointDefinition,
    apiDefinition: ApiV1Write.ApiDefinition
): ApiV1Write.ExampleEndpointCall {
    const resolveTypeById = (typeId: ApiV1Write.TypeId): ApiV1Write.TypeDefinition => {
        const typeDefinition = apiDefinition.types[typeId];
        if (typeDefinition == null) {
            throw new Error(`Failed to find ${typeId}`);
        }
        return typeDefinition;
    };

    const exampleEndpointCall: Omit<ApiV1Write.ExampleEndpointCall, "path"> = {
        pathParameters: endpointDefinition.path.pathParameters.reduce(
            (acc, pathParameter) => ({
                ...acc,
                [pathParameter.key]: generateExampleFromTypeReference(pathParameter.type, resolveTypeById),
            }),
            {}
        ),
        queryParameters: endpointDefinition.queryParameters.reduce((acc, queryParameter) => {
            const value = generateExampleFromTypeReference(queryParameter.type, resolveTypeById);
            if (value == null) {
                return acc;
            }
            return {
                ...acc,
                [queryParameter.key]: value,
            };
        }, {}),
        headers: endpointDefinition.headers.reduce((acc, header) => {
            const value = generateExampleFromTypeReference(header.type, resolveTypeById);
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
        responseStatusCode: 200,
        responseBody:
            endpointDefinition.response != null
                ? generateHttpResponseBodyExample(endpointDefinition.response.type, resolveTypeById)
                : undefined,
    };

    return {
        path: generatePath(endpointDefinition.path, exampleEndpointCall.pathParameters),
        ...exampleEndpointCall,
    };
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
