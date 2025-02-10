import { compact } from "es-toolkit/array";
import { mapValues, omitBy, pick } from "es-toolkit/object";

import type {
  EndpointContext,
  ObjectProperty,
} from "@fern-api/fdr-sdk/api-definition";
import { ExampleEndpointCall } from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { FernUser } from "@fern-docs/auth";

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
              value: omitUndefinedValues(
                mapValues(
                  exampleCall.requestBody.value,
                  (exampleValue): PlaygroundFormDataEntryValue | undefined =>
                    exampleValue.type === "filename" ||
                    exampleValue.type === "filenameWithData"
                      ? { type: "file", value: undefined }
                      : exampleValue.type === "filenames" ||
                          exampleValue.type === "filenamesWithData"
                        ? { type: "fileArray", value: [] }
                        : exampleValue.type === "json" &&
                            exampleValue.value !== undefined
                          ? {
                              type: "json",
                              value: exampleValue.value,
                            }
                          : undefined
                )
              ),
            }
          : exampleCall?.requestBody?.type === "bytes"
            ? { type: "octet-stream", value: undefined }
            : { type: "json", value: exampleCall?.requestBody?.value }
        : getEmptyValueForHttpRequestBody(
            context?.endpoint.requests?.[0]?.body,
            context?.types ?? EMPTY_OBJECT
          ),
  };
}

function omitUndefinedValues<T>(
  record: Record<string, T>
): Record<string, NonNullable<T>> {
  return omitBy(record, (value) => value == null) as Record<
    string,
    NonNullable<T>
  >;
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
