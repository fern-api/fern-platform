import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";

import { useAtomValue } from "jotai";

import {
  type EndpointContext,
  PropertyKey,
} from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_ARRAY, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { FERN_USER_ATOM } from "../../atoms";
import { PlaygroundFileUploadForm } from "../form/PlaygroundFileUploadForm";
import { PlaygroundObjectForm } from "../form/PlaygroundObjectForm";
import { PlaygroundObjectPropertiesForm } from "../form/PlaygroundObjectPropertyForm";
import {
  PlaygroundEndpointRequestFormState,
  PlaygroundFormStateBody,
} from "../types";
import { pascalCaseHeaderKey } from "../utils/header-key-case";
import { PlaygroundEndpointAliasForm } from "./PlaygroundEndpointAliasForm";
import { PlaygroundEndpointFormSection } from "./PlaygroundEndpointFormSection";
import { PlaygroundEndpointMultipartForm } from "./PlaygroundEndpointMultipartForm";

interface PlaygroundEndpointFormProps {
  context: EndpointContext;
  formState: PlaygroundEndpointRequestFormState | undefined;
  setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
  ignoreHeaders?: boolean;
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointFormProps> = ({
  context: { endpoint, types, globalHeaders },
  formState,
  setFormState,
  ignoreHeaders,
}) => {
  const {
    headers: initialHeaders,
    query_parameters: initialQueryParameters,
    path_parameters: initialPathParameters,
  } = useAtomValue(FERN_USER_ATOM)?.playground?.initial_state ?? {};

  const setHeaders = useCallback(
    (value: ((old: unknown) => unknown) | unknown) => {
      setFormState((state) => ({
        ...state,
        headers: typeof value === "function" ? value(state.headers) : value,
      }));
    },
    [setFormState]
  );

  const setPathParameters = useCallback(
    (value: ((old: unknown) => unknown) | unknown) => {
      setFormState((state) => ({
        ...state,
        pathParameters:
          typeof value === "function" ? value(state.pathParameters) : value,
      }));
    },
    [setFormState]
  );

  const setQueryParameters = useCallback(
    (value: ((old: unknown) => unknown) | unknown) => {
      setFormState((state) => ({
        ...state,
        queryParameters:
          typeof value === "function" ? value(state.queryParameters) : value,
      }));
    },
    [setFormState]
  );

  const setBody = useCallback(
    (
      value:
        | ((
            old: PlaygroundFormStateBody | undefined
          ) => PlaygroundFormStateBody | undefined)
        | PlaygroundFormStateBody
        | undefined
    ) => {
      setFormState((state) => ({
        ...state,
        body: typeof value === "function" ? value(state.body) : value,
      }));
    },
    [setFormState]
  );

  const setBodyJson = useCallback(
    (value: ((old: unknown) => unknown) | unknown) => {
      setBody((old) => {
        return {
          type: "json",
          value:
            typeof value === "function"
              ? value(old?.type === "json" ? old.value : undefined)
              : value,
        };
      });
    },
    [setBody]
  );

  const setBodyOctetStream = useCallback(
    (
      value: ((old: File | undefined) => File | undefined) | File | undefined
    ) => {
      setBody((old) => {
        return {
          type: "octet-stream",
          value:
            typeof value === "function"
              ? value(old?.type === "octet-stream" ? old.value : undefined)
              : value,
        };
      });
    },
    [setBody]
  );

  const headers = useMemo(() => {
    return [...globalHeaders, ...(endpoint.requestHeaders ?? EMPTY_ARRAY)];
  }, [endpoint.requestHeaders, globalHeaders]);

  return (
    <>
      {headers != null && headers.length > 0 && (
        <PlaygroundEndpointFormSection
          ignoreHeaders={ignoreHeaders}
          title="Headers"
        >
          <PlaygroundObjectPropertiesForm
            id="header"
            properties={headers.map((header) => ({
              ...header,
              key: PropertyKey(pascalCaseHeaderKey(header.key)),
            }))}
            extraProperties={undefined}
            onChange={setHeaders}
            value={formState?.headers}
            types={types}
          />
        </PlaygroundEndpointFormSection>
      )}

      {endpoint.pathParameters != null &&
        endpoint.pathParameters.length > 0 && (
          <PlaygroundEndpointFormSection
            ignoreHeaders={ignoreHeaders}
            title="Path Parameters"
          >
            <PlaygroundObjectPropertiesForm
              id="path"
              properties={endpoint.pathParameters ?? EMPTY_ARRAY}
              extraProperties={undefined}
              onChange={setPathParameters}
              value={formState?.pathParameters}
              types={types}
            />
          </PlaygroundEndpointFormSection>
        )}

      {endpoint.queryParameters != null &&
        endpoint.queryParameters.length > 0 && (
          <PlaygroundEndpointFormSection
            ignoreHeaders={ignoreHeaders}
            title="Query Parameters"
          >
            <PlaygroundObjectPropertiesForm
              id="query"
              properties={endpoint.queryParameters ?? EMPTY_ARRAY}
              extraProperties={undefined}
              onChange={setQueryParameters}
              value={formState?.queryParameters}
              types={types}
            />
          </PlaygroundEndpointFormSection>
        )}

      {endpoint.requests?.[0]?.body != null &&
        visitDiscriminatedUnion(endpoint.requests[0]?.body)._visit({
          formData: (formData) => (
            <PlaygroundEndpointFormSection
              ignoreHeaders={ignoreHeaders}
              title="Multipart Form"
            >
              <PlaygroundEndpointMultipartForm
                endpoint={endpoint}
                formState={formState}
                formData={formData}
                types={types}
                setBody={setBody}
              />
            </PlaygroundEndpointFormSection>
          ),
          bytes: (bytes) => (
            <PlaygroundEndpointFormSection
              ignoreHeaders={ignoreHeaders}
              title="Body"
            >
              <PlaygroundFileUploadForm
                id="body"
                propertyKey="body"
                isOptional={bytes.isOptional}
                type="file"
                onValueChange={(files) => setBodyOctetStream(files?.[0])}
                value={
                  formState?.body?.type === "octet-stream" &&
                  formState.body.value != null
                    ? [formState.body.value]
                    : undefined
                }
              />
            </PlaygroundEndpointFormSection>
          ),
          object: (value) => {
            return (
              <PlaygroundEndpointFormSection
                ignoreHeaders={ignoreHeaders}
                title="Body Parameters"
              >
                <PlaygroundObjectForm
                  id="body"
                  shape={value}
                  onChange={setBodyJson}
                  value={formState?.body?.value}
                  types={types}
                />
              </PlaygroundEndpointFormSection>
            );
          },
          alias: (alias) => {
            return (
              <PlaygroundEndpointAliasForm
                alias={alias}
                types={types}
                ignoreHeaders={ignoreHeaders ?? false}
                setBodyJson={setBodyJson}
                value={formState?.body?.value}
              />
            );
          },
        })}
    </>
  );
};
