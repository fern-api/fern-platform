import { titleCase, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { FernCard } from "../components/FernCard";
import {
    ResolvedEndpointDefinition,
    ResolvedTypeDefinition,
    dereferenceObjectProperties,
    unwrapReference,
    visitResolvedHttpRequestBodyShape,
} from "../resolver/types";
import { PlaygroundFileUploadForm } from "./form/PlaygroundFileUploadForm";
import { PlaygroundObjectPropertiesForm, PlaygroundObjectPropertyForm } from "./form/PlaygroundObjectPropertyForm";
import { PlaygroundTypeReferenceForm } from "./form/PlaygroundTypeReferenceForm";
import { PlaygroundEndpointRequestFormState, PlaygroundFormDataEntryValue, PlaygroundFormStateBody } from "./types";

interface PlaygroundEndpointFormProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointFormProps> = ({
    endpoint,
    formState,
    setFormState,
    types,
}) => {
    const setHeaders = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                headers: typeof value === "function" ? value(state.headers) : value,
            }));
        },
        [setFormState],
    );

    const setPathParameters = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                pathParameters: typeof value === "function" ? value(state.pathParameters) : value,
            }));
        },
        [setFormState],
    );

    const setQueryParameters = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                queryParameters: typeof value === "function" ? value(state.queryParameters) : value,
            }));
        },
        [setFormState],
    );

    const setBody = useCallback(
        (
            value:
                | ((old: PlaygroundFormStateBody | undefined) => PlaygroundFormStateBody | undefined)
                | PlaygroundFormStateBody
                | undefined,
        ) => {
            setFormState((state) => ({
                ...state,
                body: typeof value === "function" ? value(state.body) : value,
            }));
        },
        [setFormState],
    );

    const setBodyJson = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setBody((old) => {
                return {
                    type: "json",
                    value: typeof value === "function" ? value(old?.type === "json" ? old.value : undefined) : value,
                };
            });
        },
        [setBody],
    );

    const setBodyOctetStream = useCallback(
        (value: ((old: File | undefined) => File | undefined) | File | undefined) => {
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
        [setBody],
    );

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
                endpoint.requestBody[0]?.shape.type === "formData"
                    ? endpoint.requestBody[0]?.shape.properties.find((p) => p.key === key)?.type
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
        <div className="col-span-2 space-y-8 sm:pb-20">
            {endpoint.headers.length > 0 && (
                <div>
                    <div className="mb-4 px-4">
                        <h5 className="t-muted m-0">Headers</h5>
                    </div>
                    <FernCard className="rounded-xl p-4 shadow-sm">
                        <PlaygroundObjectPropertiesForm
                            id="header"
                            properties={endpoint.headers}
                            onChange={setHeaders}
                            value={formState?.headers}
                            types={types}
                        />
                    </FernCard>
                </div>
            )}

            {endpoint.pathParameters.length > 0 && (
                <div>
                    <div className="mb-4 px-4">
                        <h5 className="t-muted m-0">Path Parameters</h5>
                    </div>
                    <FernCard className="rounded-xl p-4 shadow-sm">
                        <PlaygroundObjectPropertiesForm
                            id="path"
                            properties={endpoint.pathParameters}
                            onChange={setPathParameters}
                            value={formState?.pathParameters}
                            types={types}
                        />
                    </FernCard>
                </div>
            )}

            {endpoint.queryParameters.length > 0 && (
                <div>
                    <div className="mb-4 px-4">
                        <h5 className="t-muted m-0">Query Parameters</h5>
                    </div>
                    <FernCard className="rounded-xl p-4 shadow-sm">
                        <PlaygroundObjectPropertiesForm
                            id="query"
                            properties={endpoint.queryParameters}
                            onChange={setQueryParameters}
                            value={formState?.queryParameters}
                            types={types}
                        />
                    </FernCard>
                </div>
            )}

            {endpoint.requestBody[0] != null &&
                visitResolvedHttpRequestBodyShape(endpoint.requestBody[0].shape, {
                    formData: (formData) => {
                        const formDataFormValue = formState?.body?.type === "form-data" ? formState?.body.value : {};
                        return (
                            <div className="min-w-0 flex-1 shrink">
                                <div className="mb-4 px-4">
                                    <h5 className="t-muted m-0">{titleCase(formData.name)}</h5>
                                </div>
                                <FernCard className="rounded-xl p-4 shadow-sm">
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
                                                                onValueChange={(files) =>
                                                                    handleFormDataFileChange(property.key, files)
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
                                                fileArray: (fileArray) => {
                                                    const currentValue = formDataFormValue[property.key];
                                                    return (
                                                        <li key={property.key}>
                                                            <PlaygroundFileUploadForm
                                                                id={`body.${property.key}`}
                                                                propertyKey={property.key}
                                                                type={fileArray.type}
                                                                isOptional={fileArray.isOptional}
                                                                onValueChange={(files) =>
                                                                    handleFormDataFileChange(property.key, files)
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
                                </FernCard>
                            </div>
                        );
                    },
                    bytes: (bytes) => (
                        <div>
                            <div className="mb-4 px-4">
                                <h5 className="t-muted m-0">Body</h5>
                            </div>
                            <FernCard className="rounded-xl p-4 shadow-sm">
                                <PlaygroundFileUploadForm
                                    id="body"
                                    propertyKey="body"
                                    isOptional={bytes.isOptional}
                                    type="file"
                                    onValueChange={(files) => setBodyOctetStream(files?.[0])}
                                    value={
                                        formState?.body?.type === "octet-stream" && formState.body.value != null
                                            ? [formState.body.value]
                                            : undefined
                                    }
                                />
                            </FernCard>
                        </div>
                    ),
                    typeShape: (shape) => {
                        shape = unwrapReference(shape, types);

                        if (shape.type === "object") {
                            return (
                                <div>
                                    <div className="mb-4 px-4">
                                        <h5 className="t-muted m-0">Body Parameters</h5>
                                    </div>
                                    <FernCard className="rounded-xl p-4 shadow-sm">
                                        <PlaygroundObjectPropertiesForm
                                            id="body"
                                            properties={dereferenceObjectProperties(shape, types)}
                                            onChange={setBodyJson}
                                            value={formState?.body?.value}
                                            types={types}
                                        />
                                    </FernCard>
                                </div>
                            );
                        } else if (shape.type === "optional") {
                            return (
                                <div>
                                    <div className="mb-4 px-4">
                                        <h5 className="t-muted m-0">Optional Body</h5>
                                    </div>
                                    <FernCard className="rounded-xl p-4 shadow-sm">
                                        <PlaygroundTypeReferenceForm
                                            id="body"
                                            shape={shape.shape}
                                            onChange={setBodyJson}
                                            value={formState?.body?.value}
                                            onlyRequired
                                            types={types}
                                        />
                                    </FernCard>
                                </div>
                            );
                        }

                        return (
                            <div>
                                <FernCard className="rounded-xl p-4 shadow-sm">
                                    <div className="mb-4">
                                        <h5 className="t-muted m-0">Body</h5>
                                    </div>
                                    <PlaygroundTypeReferenceForm
                                        id="body"
                                        shape={shape}
                                        onChange={setBodyJson}
                                        value={formState?.body?.value}
                                        onlyRequired
                                        types={types}
                                    />
                                </FernCard>
                            </div>
                        );
                    },
                })}
        </div>
    );
};
