import { titleCase } from "@fern-api/fdr-sdk";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import {
    ResolvedEndpointDefinition,
    ResolvedTypeDefinition,
    dereferenceObjectProperties,
    unwrapReference,
    visitResolvedHttpRequestBodyShape,
} from "../../resolver/types";
import { PlaygroundFileUploadForm } from "../form/PlaygroundFileUploadForm";
import { PlaygroundObjectPropertiesForm } from "../form/PlaygroundObjectPropertyForm";
import { PlaygroundTypeReferenceForm } from "../form/PlaygroundTypeReferenceForm";
import { PlaygroundEndpointRequestFormState, PlaygroundFormStateBody } from "../types";
import { PlaygroundEndpointFormSection } from "./PlaygroundEndpointFormSection";
import { PlaygroundEndpointMultipartForm } from "./PlaygroundEndpointMultipartForm";

interface PlaygroundEndpointFormProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    types: Record<string, ResolvedTypeDefinition>;
    ignoreHeaders?: boolean;
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointFormProps> = ({
    endpoint,
    formState,
    setFormState,
    types,
    ignoreHeaders,
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

    return (
        <>
            {endpoint.headers.length > 0 && (
                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Headers">
                    <PlaygroundObjectPropertiesForm
                        id="header"
                        properties={endpoint.headers}
                        onChange={setHeaders}
                        value={formState?.headers}
                        types={types}
                    />
                </PlaygroundEndpointFormSection>
            )}

            {endpoint.pathParameters.length > 0 && (
                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Path Parameters">
                    <PlaygroundObjectPropertiesForm
                        id="path"
                        properties={endpoint.pathParameters}
                        onChange={setPathParameters}
                        value={formState?.pathParameters}
                        types={types}
                    />
                </PlaygroundEndpointFormSection>
            )}

            {endpoint.queryParameters.length > 0 && (
                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Query Parameters">
                    <PlaygroundObjectPropertiesForm
                        id="query"
                        properties={endpoint.queryParameters}
                        onChange={setQueryParameters}
                        value={formState?.queryParameters}
                        types={types}
                    />
                </PlaygroundEndpointFormSection>
            )}

            {endpoint.requestBody != null &&
                visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                    formData: (formData) => (
                        <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title={titleCase(formData.name)}>
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
                        <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Body">
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
                        </PlaygroundEndpointFormSection>
                    ),
                    typeShape: (shape) => {
                        shape = unwrapReference(shape, types);

                        if (shape.type === "object") {
                            return (
                                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Body Parameters">
                                    <PlaygroundObjectPropertiesForm
                                        id="body"
                                        properties={dereferenceObjectProperties(shape, types)}
                                        onChange={setBodyJson}
                                        value={formState?.body?.value}
                                        types={types}
                                    />
                                </PlaygroundEndpointFormSection>
                            );
                        } else if (shape.type === "optional") {
                            return (
                                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Optional Body">
                                    <PlaygroundTypeReferenceForm
                                        id="body"
                                        shape={shape.shape}
                                        onChange={setBodyJson}
                                        value={formState?.body?.value}
                                        onlyRequired
                                        types={types}
                                    />
                                </PlaygroundEndpointFormSection>
                            );
                        }

                        return (
                            <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Body">
                                <PlaygroundTypeReferenceForm
                                    id="body"
                                    shape={shape}
                                    onChange={setBodyJson}
                                    value={formState?.body?.value}
                                    onlyRequired
                                    types={types}
                                />
                            </PlaygroundEndpointFormSection>
                        );
                    },
                })}
        </>
    );
};
