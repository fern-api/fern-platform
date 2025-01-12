import {
  PropertyKey,
  type EndpointContext,
} from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_ARRAY, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { useAtomValue } from "jotai";
import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";
import { FERN_USER_ATOM } from "../../atoms";
import { ExplorerFileUploadForm } from "../form/ExplorerFileUploadForm";
import { ExplorerObjectForm } from "../form/ExplorerObjectForm";
import { ExplorerObjectPropertiesForm } from "../form/ExplorerObjectPropertyForm";
import {
  ExplorerEndpointRequestFormState,
  ExplorerFormStateBody,
} from "../types";
import {
  pascalCaseHeaderKey,
  pascalCaseHeaderKeys,
} from "../utils/header-key-case";
import { ExplorerEndpointAliasForm } from "./ExplorerEndpointAliasForm";
import { ExplorerEndpointFormSection } from "./ExplorerEndpointFormSection";
import { ExplorerEndpointMultipartForm } from "./ExplorerEndpointMultipartForm";

interface ExplorerEndpointFormProps {
  context: EndpointContext;
  formState: ExplorerEndpointRequestFormState | undefined;
  setFormState: Dispatch<SetStateAction<ExplorerEndpointRequestFormState>>;
  ignoreHeaders?: boolean;
}

export const ExplorerEndpointForm: FC<ExplorerEndpointFormProps> = ({
  context: { endpoint, types, globalHeaders },
  formState,
  setFormState,
  ignoreHeaders,
}) => {
  const {
    headers: initialHeaders,
    query_parameters: initialQueryParameters,
    path_parameters: initialPathParameters,
  } = useAtomValue(FERN_USER_ATOM)?.explorer?.initial_state ?? {};

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
            old: ExplorerFormStateBody | undefined
          ) => ExplorerFormStateBody | undefined)
        | ExplorerFormStateBody
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
        <ExplorerEndpointFormSection
          ignoreHeaders={ignoreHeaders}
          title="Headers"
        >
          <ExplorerObjectPropertiesForm
            id="header"
            properties={headers.map((header) => ({
              ...header,
              key: PropertyKey(pascalCaseHeaderKey(header.key)),
            }))}
            extraProperties={undefined}
            onChange={setHeaders}
            value={formState?.headers}
            defaultValue={pascalCaseHeaderKeys(initialHeaders)}
            types={types}
          />
        </ExplorerEndpointFormSection>
      )}

      {endpoint.pathParameters != null &&
        endpoint.pathParameters.length > 0 && (
          <ExplorerEndpointFormSection
            ignoreHeaders={ignoreHeaders}
            title="Path Parameters"
          >
            <ExplorerObjectPropertiesForm
              id="path"
              properties={endpoint.pathParameters ?? EMPTY_ARRAY}
              extraProperties={undefined}
              onChange={setPathParameters}
              value={formState?.pathParameters}
              defaultValue={initialPathParameters}
              types={types}
            />
          </ExplorerEndpointFormSection>
        )}

      {endpoint.queryParameters != null &&
        endpoint.queryParameters.length > 0 && (
          <ExplorerEndpointFormSection
            ignoreHeaders={ignoreHeaders}
            title="Query Parameters"
          >
            <ExplorerObjectPropertiesForm
              id="query"
              properties={endpoint.queryParameters ?? EMPTY_ARRAY}
              extraProperties={undefined}
              onChange={setQueryParameters}
              value={formState?.queryParameters}
              defaultValue={initialQueryParameters}
              types={types}
            />
          </ExplorerEndpointFormSection>
        )}

      {endpoint.requests?.[0]?.body != null &&
        visitDiscriminatedUnion(endpoint.requests[0]?.body)._visit({
          formData: (formData) => (
            <ExplorerEndpointFormSection
              ignoreHeaders={ignoreHeaders}
              title="Multipart Form"
            >
              <ExplorerEndpointMultipartForm
                endpoint={endpoint}
                formState={formState}
                formData={formData}
                types={types}
                setBody={setBody}
              />
            </ExplorerEndpointFormSection>
          ),
          bytes: (bytes) => (
            <ExplorerEndpointFormSection
              ignoreHeaders={ignoreHeaders}
              title="Body"
            >
              <ExplorerFileUploadForm
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
            </ExplorerEndpointFormSection>
          ),
          object: (value) => {
            return (
              <ExplorerEndpointFormSection
                ignoreHeaders={ignoreHeaders}
                title="Body Parameters"
              >
                <ExplorerObjectForm
                  id="body"
                  shape={value}
                  onChange={setBodyJson}
                  value={formState?.body?.value}
                  types={types}
                />
              </ExplorerEndpointFormSection>
            );
          },
          alias: (alias) => {
            return (
              <ExplorerEndpointAliasForm
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
