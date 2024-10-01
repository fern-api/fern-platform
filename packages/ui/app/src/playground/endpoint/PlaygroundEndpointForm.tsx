import { unwrapObjectType, unwrapReference } from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_ARRAY, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isEmpty } from "lodash-es";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { PlaygroundFileUploadForm } from "../form/PlaygroundFileUploadForm";
import { PlaygroundObjectPropertiesForm } from "../form/PlaygroundObjectPropertyForm";
import { PlaygroundTypeReferenceForm } from "../form/PlaygroundTypeReferenceForm";
import { PlaygroundEndpointRequestFormState, PlaygroundFormStateBody } from "../types";
import { EndpointContext } from "../types/endpoint-context";
import { PlaygroundEndpointFormSection } from "./PlaygroundEndpointFormSection";
import { PlaygroundEndpointMultipartForm } from "./PlaygroundEndpointMultipartForm";

interface PlaygroundEndpointFormProps {
    context: EndpointContext;
    formState: PlaygroundEndpointRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    ignoreHeaders?: boolean;
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointFormProps> = ({
    context: { endpoint, types },
    formState,
    setFormState,
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
            {!isEmpty(endpoint.requestHeaders) && (
                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Headers">
                    <PlaygroundObjectPropertiesForm
                        id="header"
                        properties={endpoint.requestHeaders ?? EMPTY_ARRAY}
                        onChange={setHeaders}
                        value={formState?.headers}
                        types={types}
                    />
                </PlaygroundEndpointFormSection>
            )}

            {!isEmpty(endpoint.pathParameters) && (
                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Path Parameters">
                    <PlaygroundObjectPropertiesForm
                        id="path"
                        properties={endpoint.pathParameters ?? EMPTY_ARRAY}
                        onChange={setPathParameters}
                        value={formState?.pathParameters}
                        types={types}
                    />
                </PlaygroundEndpointFormSection>
            )}

            {!isEmpty(endpoint.queryParameters) && (
                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Query Parameters">
                    <PlaygroundObjectPropertiesForm
                        id="query"
                        properties={endpoint.queryParameters ?? EMPTY_ARRAY}
                        onChange={setQueryParameters}
                        value={formState?.queryParameters}
                        types={types}
                    />
                </PlaygroundEndpointFormSection>
            )}

            {endpoint.request?.body != null &&
                visitDiscriminatedUnion(endpoint.request.body)._visit({
                    formData: (formData) => (
                        <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Multipart Form">
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
                    object: (value) => (
                        <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Body Parameters">
                            <PlaygroundObjectPropertiesForm
                                id="body"
                                properties={unwrapObjectType(value, types).properties}
                                onChange={setBodyJson}
                                value={formState?.body?.value}
                                types={types}
                            />
                        </PlaygroundEndpointFormSection>
                    ),
                    alias: (alias) => {
                        const { shape, isOptional } = unwrapReference(alias.value, types);

                        if (shape.type === "object" && !isOptional) {
                            return (
                                <PlaygroundEndpointFormSection ignoreHeaders={ignoreHeaders} title="Body Parameters">
                                    <PlaygroundObjectPropertiesForm
                                        id="body"
                                        properties={unwrapObjectType(shape, types).properties}
                                        onChange={setBodyJson}
                                        value={formState?.body?.value}
                                        types={types}
                                    />
                                </PlaygroundEndpointFormSection>
                            );
                        }
                        return (
                            <PlaygroundEndpointFormSection
                                ignoreHeaders={ignoreHeaders}
                                title={isOptional ? "Optional Body" : "Body"}
                            >
                                <PlaygroundTypeReferenceForm
                                    id="body"
                                    shape={shape}
                                    onChange={setBodyJson}
                                    value={formState?.body?.value}
                                    types={types}
                                />
                            </PlaygroundEndpointFormSection>
                        );
                    },
                })}
        </>
    );
};
