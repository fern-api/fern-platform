import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { ExampleEndpointCall } from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { mapValues } from "lodash-es";
import { PlaygroundEndpointRequestFormState, PlaygroundFormDataEntryValue } from "../types";
import { getEmptyValueForHttpRequestBody, getEmptyValueForObjectProperties } from "./default-values";

export function getInitialEndpointRequestFormState(
    ctx: EndpointContext | undefined,
): PlaygroundEndpointRequestFormState {
    return {
        type: "endpoint",
        headers: getEmptyValueForObjectProperties(
            [...(ctx?.globalHeaders ?? []), ...(ctx?.endpoint?.requestHeaders ?? [])],
            ctx?.types ?? EMPTY_OBJECT,
        ),
        pathParameters: getEmptyValueForObjectProperties(ctx?.endpoint?.pathParameters, ctx?.types ?? EMPTY_OBJECT),
        queryParameters: getEmptyValueForObjectProperties(ctx?.endpoint?.queryParameters, ctx?.types ?? EMPTY_OBJECT),
        body: getEmptyValueForHttpRequestBody(ctx?.endpoint?.request?.body, ctx?.types ?? EMPTY_OBJECT),
    };
}

export function getInitialEndpointRequestFormStateWithExample(
    context: EndpointContext | undefined,
    exampleCall: ExampleEndpointCall | undefined,
): PlaygroundEndpointRequestFormState {
    if (exampleCall == null) {
        return getInitialEndpointRequestFormState(context);
    }
    return {
        type: "endpoint",
        headers: exampleCall.headers ?? {},
        pathParameters: exampleCall.pathParameters ?? {},
        queryParameters: exampleCall.queryParameters ?? {},
        body:
            exampleCall.requestBody?.type === "form"
                ? {
                      type: "form-data",
                      value: mapValues(
                          exampleCall.requestBody.value,
                          (exampleValue): PlaygroundFormDataEntryValue =>
                              exampleValue.type === "filename" || exampleValue.type === "filenameWithData"
                                  ? { type: "file", value: undefined }
                                  : exampleValue.type === "filenames" || exampleValue.type === "filenamesWithData"
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
