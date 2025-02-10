import assertNever from "@fern-api/ui-core-utils/assertNever";

import { APIV1Write } from "../../../client";
import {
  ResolveTypeById,
  generateExampleFromTypeReference,
  generateExampleFromTypeShape,
  generateHttpRequestBodyExample,
  generateHttpResponseBodyExample,
} from "./generateHttpBodyExample";

const MAX_OPTIONAL_EXAMPLES_FOR_QUERY_PARAMS = 2;

export function generateEndpointErrorExample({
  endpointDefinition,
  apiDefinition,
  errorDeclaration,
}: {
  endpointDefinition: APIV1Write.EndpointDefinition;
  apiDefinition: APIV1Write.ApiDefinition;
  errorDeclaration: APIV1Write.ErrorDeclarationV2;
}): APIV1Write.ExampleEndpointCall {
  const resolveTypeById = getResolveByTypeId(apiDefinition);
  return {
    ...generateBaseEndpointExample({
      endpointDefinition,
      apiDefinition,
      resolveTypeById,
    }),
    responseStatusCode: errorDeclaration.statusCode,
    responseBodyV3:
      errorDeclaration.type != null
        ? {
            type: "json",
            value: generateExampleFromTypeShape(
              errorDeclaration.type,
              resolveTypeById,
              false,
              new Set(),
              0
            ),
          }
        : undefined,
  };
}

export function generateEndpointNonStreamResponseExample({
  endpointDefinition,
  apiDefinition,
  nonStreamResponse,
}: {
  endpointDefinition: APIV1Write.EndpointDefinition;
  apiDefinition: APIV1Write.ApiDefinition;
  nonStreamResponse: APIV1Write.NonStreamResponse;
}): APIV1Write.ExampleEndpointCall {
  const resolveTypeById = getResolveByTypeId(apiDefinition);
  return {
    ...generateBaseEndpointExample({
      endpointDefinition,
      apiDefinition,
      resolveTypeById,
    }),
    responseStatusCode: 200,
    responseBodyV3: generateHttpResponseBodyExample(
      nonStreamResponse.shape,
      resolveTypeById
    ),
  };
}

export function generateEndpointStreamResponseExample({
  endpointDefinition,
  apiDefinition,
  streamResponse,
}: {
  endpointDefinition: APIV1Write.EndpointDefinition;
  apiDefinition: APIV1Write.ApiDefinition;
  streamResponse: APIV1Write.StreamResponse;
}): APIV1Write.ExampleEndpointCall {
  const resolveTypeById = getResolveByTypeId(apiDefinition);

  return {
    ...generateBaseEndpointExample({
      endpointDefinition,
      apiDefinition,
      resolveTypeById,
    }),
    responseStatusCode: 200,
    responseBodyV3: generateHttpResponseBodyExample(
      streamResponse.shape,
      resolveTypeById
    ),
  };
}

export function generateEndpointSuccessExample({
  endpointDefinition,
  apiDefinition,
}: {
  endpointDefinition: APIV1Write.EndpointDefinition;
  apiDefinition: APIV1Write.ApiDefinition;
}): APIV1Write.ExampleEndpointCall {
  const resolveTypeById = getResolveByTypeId(apiDefinition);
  return {
    ...generateBaseEndpointExample({
      endpointDefinition,
      apiDefinition,
      resolveTypeById,
    }),
    responseStatusCode: 200,
    responseBodyV3:
      endpointDefinition.response != null
        ? generateHttpResponseBodyExample(
            endpointDefinition.response.type,
            resolveTypeById
          )
        : undefined,
  };
}

function generateBaseEndpointExample({
  endpointDefinition,
  apiDefinition,
  resolveTypeById,
}: {
  endpointDefinition: APIV1Write.EndpointDefinition;
  apiDefinition: APIV1Write.ApiDefinition;
  resolveTypeById: ResolveTypeById;
}): Omit<APIV1Write.ExampleEndpointCall, "responseStatusCode"> {
  const pathParameters = generatePathParameterExamples({
    pathParameters: endpointDefinition.path.pathParameters,
    apiDefinition,
    resolveTypeById,
  });
  const path = generatePath(endpointDefinition.path, pathParameters);
  const queryParameters = generateQueryParameterExamples({
    resolveTypeById,
    queryParameters: endpointDefinition.queryParameters,
  });
  const headers = generateHeaderExamples({
    headers: [
      ...(apiDefinition.globalHeaders ?? []),
      ...endpointDefinition.headers,
    ],
    resolveTypeById,
  });
  const requestBodyV3 =
    endpointDefinition.request != null
      ? generateHttpRequestBodyExample(
          endpointDefinition.request.type,
          resolveTypeById
        )
      : undefined;
  return {
    path,
    pathParameters,
    queryParameters,
    headers,
    requestBodyV3,

    name: undefined,
    requestBody: undefined,
    responseBody: undefined,
    responseBodyV3: undefined,
    codeSamples: undefined,
    description: undefined,
  };
}

function generatePathParameterExamples({
  pathParameters,
  apiDefinition,
  resolveTypeById,
}: {
  pathParameters: APIV1Write.PathParameter[];
  apiDefinition: APIV1Write.ApiDefinition;
  resolveTypeById: ResolveTypeById;
}): Record<string, unknown> {
  return pathParameters.reduce((acc, pathParameter) => {
    const isString = isTypeReferenceString({
      typeReference: pathParameter.type,
      types: apiDefinition.types,
    });
    return {
      ...acc,
      [pathParameter.key]: isString
        ? `:${pathParameter.key}`
        : generateExampleFromTypeReference(
            pathParameter.type,
            resolveTypeById,
            false,
            new Set(),
            0
          ),
    };
  }, {});
}

function generateQueryParameterExamples({
  queryParameters,
  resolveTypeById,
}: {
  queryParameters: APIV1Write.QueryParameter[];
  resolveTypeById: ResolveTypeById;
}): Record<string, unknown> {
  const exampleQueryParameters: Record<string, unknown> = {};
  let optionalCount = 0;
  for (const queryParameter of queryParameters) {
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
  return exampleQueryParameters;
}

function generateHeaderExamples({
  headers,
  resolveTypeById,
}: {
  headers: APIV1Write.Header[];
  resolveTypeById: ResolveTypeById;
}): Record<string, unknown> {
  return headers.reduce((acc, header) => {
    const value = generateExampleFromTypeReference(
      header.type,
      resolveTypeById,
      false,
      new Set(),
      0
    );
    if (value == null) {
      return acc;
    }
    return {
      ...acc,
      [header.key]: value,
    };
  }, {});
}

function getResolveByTypeId(
  apiDefinition: APIV1Write.ApiDefinition
): ResolveTypeById {
  return (typeId: APIV1Write.TypeId): APIV1Write.TypeDefinition => {
    const typeDefinition = apiDefinition.types[typeId];
    if (typeDefinition == null) {
      throw new Error(`Failed to find ${typeId}`);
    }
    return typeDefinition;
  };
}

function generatePath(
  path: APIV1Write.EndpointPath,
  pathParameters: Record<string, unknown>
): string {
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
  if (
    typeReference.type === "primitive" &&
    typeReference.value.type === "string"
  ) {
    return true;
  } else if (typeReference.type === "id") {
    const typeDef = types[typeReference.value];
    if (typeDef != null && typeDef.shape.type === "alias") {
      return isTypeReferenceString({
        typeReference: typeDef.shape.value,
        types,
      });
    }
  }
  return false;
}
