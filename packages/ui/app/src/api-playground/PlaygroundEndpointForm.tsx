import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { FernCard } from "../components/FernCard";
import { Callout } from "../mdx/components/Callout";
import {
    dereferenceObjectProperties,
    ResolvedEndpointDefinition,
    ResolvedTypeDefinition,
    unwrapReference,
    visitResolvedHttpRequestBodyShape,
} from "../util/resolver";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { PlaygroundEndpointRequestFormState, PlaygroundFormStateBody } from "./types";

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

    // const setBodyFormData = useCallback(
    //     (
    //         value:
    //             | ((
    //                   old: Record<string, PlaygroundFormStateBody.FormDataEntryValue>,
    //               ) => Record<string, PlaygroundFormStateBody.FormDataEntryValue>)
    //             | Record<string, PlaygroundFormStateBody.FormDataEntryValue>,
    //     ) => {
    //         setBody((old) => {
    //             return {
    //                 type: "form-data",
    //                 value:
    //                     typeof value === "function"
    //                         ? value(old?.type === "form-data" ? old.value : {})
    //                         : value,
    //             };
    //         });
    //     },
    //     [setBody],
    // );

    // const handleFileChange = useCallback(
    //     (event: React.ChangeEvent<HTMLInputElement>) => {
    //         const file = event.target.files?.[0];
    //         if (file == null) {
    //             setFormState((state) => ({
    //                 ...state,
    //                 body: {
    //                     type: "multipart/form-data",
    //                 },
    //             }));
    //             return;
    //         }

    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             setFormState((state) => ({
    //                 ...state,
    //                 body: reader.result,
    //             }));
    //         };
    //         reader.readAsDataURL(file);
    //     },
    //     [setFormState],
    // );

    return (
        <div className="col-span-2 space-y-8 pb-20">
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
                    fileUpload: () => (
                        <div>
                            <div className="mb-4 px-4">
                                <h5 className="t-muted m-0">Body</h5>
                            </div>
                            <FernCard className="rounded-xl p-4 shadow-sm">
                                <Callout intent="warning">File upload is not yet supported.</Callout>
                            </FernCard>
                        </div>
                    ),
                    bytes: () => (
                        <div>
                            <div className="mb-4 px-4">
                                <h5 className="t-muted m-0">Body</h5>
                            </div>
                            <FernCard className="rounded-xl p-4 shadow-sm">
                                <Callout intent="warning">File upload is not yet supported.</Callout>
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
                                            value={formState?.body}
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
                                            value={formState?.body}
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
                                        value={formState?.body}
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
