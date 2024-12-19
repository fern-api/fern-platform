import type {
    EndpointContext,
    ObjectProperty,
} from "@fern-api/fdr-sdk/api-definition";
import { ExampleEndpointCall } from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { FernUser } from "@fern-docs/auth";
import { compact } from "es-toolkit/array";
import { mapValues, pick } from "es-toolkit/object";
import type {
    PlaygroundEndpointRequestFormState,
    PlaygroundFormDataEntryValue,
} from "../types";
import {
    getEmptyValueForHttpRequestBody,
    getEmptyValueForObjectProperties,
} from "./default-values";
import { pascalCaseHeaderKeys } from "./header-key-case";

export function getInitialEndpointRequestFormStateWithExample(
    context: EndpointContext | undefined,
    exampleCall: ExampleEndpointCall | undefined,
    playgroundInitialState:
        | NonNullable<FernUser["playground"]>["initial_state"]
        | undefined
): PlaygroundEndpointRequestFormState {
    return {
        type: "endpoint",
        headers: {
            ...pascalCaseHeaderKeys(
                getEmptyValueForObjectProperties(
                    compact([
                        context?.globalHeaders,
                        context?.endpoint.requestHeaders,
                    ]).flat(),
                    context?.types ?? EMPTY_OBJECT
                )
            ),
            ...pascalCaseHeaderKeys(exampleCall?.headers ?? {}),
            ...pascalCaseHeaderKeys(
                filterParams(
                    playgroundInitialState?.headers ?? {},
                    compact([
                        context?.globalHeaders,
                        context?.endpoint.requestHeaders,
                    ]).flat()
                )
            ),
        },
        pathParameters: {
            ...getEmptyValueForObjectProperties(
                context?.endpoint.pathParameters ?? [],
                context?.types ?? EMPTY_OBJECT
            ),
            ...exampleCall?.pathParameters,
            ...filterParams(
                playgroundInitialState?.path_parameters ?? {},
                context?.endpoint.pathParameters ?? []
            ),
        },
        queryParameters: {
            ...getEmptyValueForObjectProperties(
                context?.endpoint.queryParameters ?? [],
                context?.types ?? EMPTY_OBJECT
            ),
            ...exampleCall?.queryParameters,
            ...filterParams(
                playgroundInitialState?.query_parameters ?? {},
                context?.endpoint.queryParameters ?? []
            ),
        },
        body:
            exampleCall != null
                ? exampleCall?.requestBody?.type === "form"
                    ? {
                          type: "form-data",
                          value: mapValues(
                              exampleCall.requestBody.value,
                              (exampleValue): PlaygroundFormDataEntryValue =>
                                  exampleValue.type === "filename" ||
                                  exampleValue.type === "filenameWithData"
                                      ? { type: "file", value: undefined }
                                      : exampleValue.type === "filenames" ||
                                          exampleValue.type ===
                                              "filenamesWithData"
                                        ? { type: "fileArray", value: [] }
                                        : {
                                              type: "json",
                                              value: exampleValue.value,
                                          }
                          ),
                      }
                    : exampleCall?.requestBody?.type === "bytes"
                      ? { type: "octet-stream", value: undefined }
                      : { type: "json", value: exampleCall?.requestBody?.value }
                : getEmptyValueForHttpRequestBody(
                      context?.endpoint.request?.body,
                      context?.types ?? EMPTY_OBJECT
                  ),
    };
}

function filterParams(
    initialStateParams: Record<string, string>,
    requestParams: ObjectProperty[]
): Record<string, string> {
    return pick(
        initialStateParams,
        requestParams.map((param) => param.key)
    );
}
