import { visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import { ReactElement, useCallback } from "react";
import { ResolvedEndpointDefinition, ResolvedFormData, ResolvedTypeDefinition } from "../../resolver/types";
import { PlaygroundFileUploadForm } from "../form/PlaygroundFileUploadForm";
import { PlaygroundObjectPropertyForm } from "../form/PlaygroundObjectPropertyForm";
import { PlaygroundEndpointRequestFormState, PlaygroundFormDataEntryValue, PlaygroundFormStateBody } from "../types";

interface PlaygroundEndpointMultipartFormProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState | undefined;
    formData: ResolvedFormData;
    types: Record<string, ResolvedTypeDefinition>;
    setBody: (
        value:
            | PlaygroundFormStateBody
            | ((old: PlaygroundFormStateBody | undefined) => PlaygroundFormStateBody | undefined)
            | undefined,
    ) => void;
}

export function PlaygroundEndpointMultipartForm({
    endpoint,
    formState,
    formData,
    types,
    setBody,
}: PlaygroundEndpointMultipartFormProps): ReactElement {
    const formDataFormValue = formState?.body?.type === "form-data" ? formState?.body.value : {};

    const setBodyFormData = useCallback(
        (
            value:
                | ((old: Record<string, PlaygroundFormDataEntryValue>) => Record<string, PlaygroundFormDataEntryValue>)
                | Record<string, PlaygroundFormDataEntryValue>,
        ) => {
            setBody((old) => {
                return {
                    type: "form-data",
                    value: typeof value === "function" ? value(old?.type === "form-data" ? old.value : {}) : value,
                };
            });
        },
        [setBody],
    );

    const setFormDataEntry = useCallback(
        (
            key: string,
            value:
                | PlaygroundFormDataEntryValue
                | undefined
                | ((old: PlaygroundFormDataEntryValue | undefined) => PlaygroundFormDataEntryValue | undefined),
        ) => {
            setBodyFormData((old) => {
                const newValue = typeof value === "function" ? value(old[key] ?? undefined) : value;
                if (newValue == null) {
                    // delete the key
                    const { [key]: _, ...rest } = old;
                    return rest;
                }
                return { ...old, [key]: newValue };
            });
        },
        [setBodyFormData],
    );

    const handleFormDataFileChange = useCallback(
        (key: string, files: ReadonlyArray<File> | undefined) => {
            const type =
                endpoint.requestBody?.shape.type === "formData"
                    ? endpoint.requestBody?.shape.properties.find((p) => p.key === key)?.type
                    : undefined;
            if (files == null || files.length === 0) {
                setFormDataEntry(key, undefined);
                return;
            } else {
                setFormDataEntry(
                    key,
                    type === "fileArray" ? { type: "fileArray", value: files } : { type: "file", value: files[0] },
                );
            }
        },
        [endpoint.requestBody, setFormDataEntry],
    );

    const handleFormDataJsonChange = useCallback(
        (key: string, value: unknown) => {
            setFormDataEntry(
                key,
                value == null
                    ? undefined
                    : typeof value === "function"
                      ? (oldValue) => ({ type: "json", value: value(oldValue?.value) })
                      : { type: "json", value },
            );
        },
        [setFormDataEntry],
    );

    return (
        <ul className="list-none space-y-8">
            {formData.properties.map((property) =>
                visitDiscriminatedUnion(property, "type")._visit({
                    file: (file) => {
                        const currentValue = formDataFormValue[property.key];
                        return (
                            <li key={property.key}>
                                <PlaygroundFileUploadForm
                                    id={`body.${property.key}`}
                                    propertyKey={property.key}
                                    type={file.type}
                                    isOptional={file.isOptional}
                                    onValueChange={(files) => handleFormDataFileChange(property.key, files)}
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
                    fileArray: (fileArray) => {
                        const currentValue = formDataFormValue[property.key];
                        return (
                            <li key={property.key}>
                                <PlaygroundFileUploadForm
                                    id={`body.${property.key}`}
                                    propertyKey={property.key}
                                    type={fileArray.type}
                                    isOptional={fileArray.isOptional}
                                    onValueChange={(files) => handleFormDataFileChange(property.key, files)}
                                    value={currentValue?.type === "fileArray" ? currentValue.value : undefined}
                                />
                            </li>
                        );
                    },
                    bodyProperty: (bodyProperty) => (
                        <li key={property.key}>
                            <PlaygroundObjectPropertyForm
                                id="body"
                                property={bodyProperty}
                                onChange={handleFormDataJsonChange}
                                value={formDataFormValue[property.key]?.value}
                                types={types}
                            />
                        </li>
                    ),
                    _other: () => null,
                }),
            )}
        </ul>
    );
}
