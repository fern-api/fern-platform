import {
  EndpointDefinition,
  HttpRequestBodyShape,
  TypeDefinition,
} from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { ReactElement, useCallback } from "react";
import { PlaygroundFileUploadForm } from "../form/PlaygroundFileUploadForm";
import { PlaygroundObjectPropertyForm } from "../form/PlaygroundObjectPropertyForm";
import {
  PlaygroundEndpointRequestFormState,
  PlaygroundFormDataEntryValue,
  PlaygroundFormStateBody,
} from "../types";

interface PlaygroundEndpointMultipartFormProps {
  endpoint: EndpointDefinition;
  formState: PlaygroundEndpointRequestFormState | undefined;
  formData: HttpRequestBodyShape.FormData;
  types: Record<string, TypeDefinition>;
  setBody: (
    value:
      | PlaygroundFormStateBody
      | ((
          old: PlaygroundFormStateBody | undefined
        ) => PlaygroundFormStateBody | undefined)
      | undefined
  ) => void;
}

export function PlaygroundEndpointMultipartForm({
  endpoint,
  formState,
  formData,
  types,
  setBody,
}: PlaygroundEndpointMultipartFormProps): ReactElement {
  const formDataFormValue =
    formState?.body?.type === "form-data" ? formState?.body.value : {};

  const setBodyFormData = useCallback(
    (
      value:
        | ((
            old: Record<string, PlaygroundFormDataEntryValue>
          ) => Record<string, PlaygroundFormDataEntryValue>)
        | Record<string, PlaygroundFormDataEntryValue>
    ) => {
      setBody((old) => {
        return {
          type: "form-data",
          value:
            typeof value === "function"
              ? value(old?.type === "form-data" ? old.value : {})
              : value,
        };
      });
    },
    [setBody]
  );

  const setFormDataEntry = useCallback(
    (
      key: string,
      value:
        | PlaygroundFormDataEntryValue
        | undefined
        | ((
            old: PlaygroundFormDataEntryValue | undefined
          ) => PlaygroundFormDataEntryValue | undefined)
    ) => {
      setBodyFormData((old) => {
        const newValue =
          typeof value === "function" ? value(old[key] ?? undefined) : value;
        if (newValue == null) {
          // delete the key
          const { [key]: _, ...rest } = old;
          return rest;
        }
        return { ...old, [key]: newValue };
      });
    },
    [setBodyFormData]
  );

  const handleFormDataFileChange = useCallback(
    (key: string, files: readonly File[] | undefined) => {
      const type =
        endpoint.requests?.[0]?.body.type === "formData"
          ? endpoint.requests[0]?.body.fields.find((p) => p.key === key)?.type
          : undefined;
      if (files == null || files.length === 0) {
        setFormDataEntry(key, undefined);
        return;
      } else {
        setFormDataEntry(
          key,
          type === "files"
            ? { type: "fileArray", value: files }
            : { type: "file", value: files[0] }
        );
      }
    },
    [endpoint, setFormDataEntry]
  );

  const handleFormDataJsonChange = useCallback(
    (key: string, value: unknown) => {
      setFormDataEntry(
        key,
        value == null
          ? undefined
          : typeof value === "function"
            ? (oldValue) => ({
                type: "json",
                value: value(oldValue?.value),
              })
            : { type: "json", value }
      );
    },
    [setFormDataEntry]
  );

  return (
    <ul className="list-none space-y-8">
      {formData.fields.map((field) =>
        visitDiscriminatedUnion(field)._visit({
          file: (file) => {
            const currentValue = formDataFormValue[field.key];
            return (
              <li key={field.key}>
                <PlaygroundFileUploadForm
                  id={`body.${field.key}`}
                  propertyKey={field.key}
                  type={file.type}
                  isOptional={file.isOptional}
                  onValueChange={(files) =>
                    handleFormDataFileChange(field.key, files)
                  }
                  value={
                    currentValue?.type === "file"
                      ? currentValue.value != null
                        ? [currentValue.value]
                        : undefined
                      : undefined
                  }
                />
              </li>
            );
          },
          files: (fileArray) => {
            const currentValue = formDataFormValue[field.key];
            return (
              <li key={field.key}>
                <PlaygroundFileUploadForm
                  id={`body.${field.key}`}
                  propertyKey={field.key}
                  type={fileArray.type}
                  isOptional={fileArray.isOptional}
                  onValueChange={(files) =>
                    handleFormDataFileChange(field.key, files)
                  }
                  value={
                    currentValue?.type === "fileArray"
                      ? currentValue.value
                      : undefined
                  }
                />
              </li>
            );
          },
          property: (bodyProperty) => (
            <li key={field.key}>
              <PlaygroundObjectPropertyForm
                id="body"
                property={bodyProperty}
                onChange={handleFormDataJsonChange}
                value={formDataFormValue[field.key]?.value}
                types={types}
              />
            </li>
          ),
        })
      )}
    </ul>
  );
}
