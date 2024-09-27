import { mapValues } from "lodash-es";
import { ResolvedEndpointDefinition, ResolvedExampleEndpointCall, ResolvedTypeDefinition } from "../../resolver/types";
import { PlaygroundEndpointRequestFormState, PlaygroundFormDataEntryValue } from "../types";
import { getDefaultValueForObjectProperties, getDefaultValuesForBody } from "./default-values";

export function getInitialEndpointRequestFormState(
    endpoint: ResolvedEndpointDefinition | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundEndpointRequestFormState {
    return {
        type: "endpoint",
        headers: getDefaultValueForObjectProperties(endpoint?.headers, types),
        pathParameters: getDefaultValueForObjectProperties(endpoint?.pathParameters, types),
        queryParameters: getDefaultValueForObjectProperties(endpoint?.queryParameters, types),
        body: getDefaultValuesForBody(endpoint?.requestBody?.shape, types),
    };
}

export function getInitialEndpointRequestFormStateWithExample(
    endpoint: ResolvedEndpointDefinition | undefined,
    exampleCall: ResolvedExampleEndpointCall | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundEndpointRequestFormState {
    if (exampleCall == null) {
        return getInitialEndpointRequestFormState(endpoint, types);
    }
    return {
        type: "endpoint",
        headers: exampleCall.headers,
        pathParameters: exampleCall.pathParameters,
        queryParameters: exampleCall.queryParameters,
        body:
            exampleCall.requestBody?.type === "form"
                ? {
                      type: "form-data",
                      value: mapValues(
                          exampleCall.requestBody.value,
                          (exampleValue): PlaygroundFormDataEntryValue =>
                              exampleValue.type === "file"
                                  ? { type: "file", value: undefined }
                                  : exampleValue.type === "fileArray"
                                    ? { type: "fileArray", value: [] }
                                    : { type: "json", value: exampleValue.value },
                      ),
                  }
                : exampleCall.requestBody?.type === "bytes"
                  ? {
                        type: "octet-stream",
                        value: undefined,
                    }
                  : { type: "json", value: exampleCall.requestBody?.value },
    };
}
