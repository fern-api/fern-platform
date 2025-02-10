import { ReactElement, useCallback } from "react";

import { PlusCircle } from "lucide-react";

import {
  EndpointDefinition,
  HttpRequestBodyShape,
  TypeDefinition,
} from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { FernButton, FernDropdown } from "@fern-docs/components";

import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthandRoot } from "../../type-shorthand";
import { PlaygroundFileUploadForm } from "../form/PlaygroundFileUploadForm";
import { PlaygroundObjectPropertyForm } from "../form/PlaygroundObjectPropertyForm";
import {
  PlaygroundEndpointRequestFormState,
  PlaygroundFormDataEntryValue,
  PlaygroundFormStateBody,
} from "../types";
import { formDataFieldIsRequired, getEmptyValueForField } from "../utils";

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

const ADD_ALL_KEY = "__FERN_ADD_ALL__";

export function PlaygroundEndpointMultipartForm({
  endpoint,
  formState,
  formData,
  types,
  setBody,
}: PlaygroundEndpointMultipartFormProps): ReactElement<any> {
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
      setFormDataEntry(key, (oldValue) => {
        const newValue =
          typeof value === "function" ? value(oldValue?.value) : value;
        if (newValue === undefined) {
          return undefined;
        } else {
          return { type: "json", value: newValue };
        }
      });
    },
    [setFormDataEntry]
  );

  const shownFields = formData.fields.filter((field) => {
    return (
      formDataFieldIsRequired(field, types) || !!formDataFormValue[field.key]
    );
  });

  const hiddenFields = formData.fields.filter(
    (field) => !shownFields.includes(field)
  );

  const handleAddAdditionalFields = (key: string) => {
    if (key === ADD_ALL_KEY) {
      setBodyFormData((old) =>
        hiddenFields.reduce(
          (acc, field) => {
            acc[field.key] = getEmptyValueForField(field, types);
            return acc;
          },
          { ...old }
        )
      );
    } else {
      const field = formData.fields.find((f) => f.key === key);
      if (field == null) {
        return;
      }
      setFormDataEntry(key, getEmptyValueForField(field, types));
    }
  };

  return (
    <ul className="list-none space-y-8">
      {shownFields.map((field) =>
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
      {hiddenFields.length > 0 && (
        <li>
          <FernDropdown
            options={[
              ...hiddenFields.map(
                (field): FernDropdown.Option => ({
                  type: "value",
                  value: field.key,
                  label: field.key,
                  helperText:
                    field.type === "property"
                      ? renderTypeShorthandRoot(
                          {
                            type: "optional",
                            shape: field.valueShape,
                            default: undefined,
                          },
                          types,
                          false,
                          true
                        )
                      : field.type,
                  labelClassName: "font-mono",
                  tooltip:
                    field.description != null ? (
                      <Markdown size="xs" mdx={field.description} />
                    ) : undefined,
                })
              ),
              ...(hiddenFields.length > 1
                ? [
                    { type: "separator" as const },
                    {
                      type: "value" as const,
                      value: ADD_ALL_KEY,
                      label: "Add all optional properties",
                      rightElement: <PlusCircle className="size-icon" />,
                    },
                  ]
                : []),
            ]}
            onValueChange={handleAddAdditionalFields}
          >
            <FernButton
              text={
                <span>
                  {`${hiddenFields.length} ${hiddenFields.length > 0 ? "more " : ""}optional field${hiddenFields.length > 1 ? "s" : ""}`}
                  <span className="t-muted ml-2 font-mono text-xs opacity-50">
                    {hiddenFields.map((field) => field.key).join(", ")}
                  </span>
                </span>
              }
              variant="outlined"
              rightIcon={<PlusCircle />}
              className="mt-8 w-full text-left first:mt-0"
            />
          </FernDropdown>
        </li>
      )}
    </ul>
  );
}
