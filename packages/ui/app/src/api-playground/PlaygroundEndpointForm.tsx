import { ResolvedEndpointDefinition, visitResolvedHttpRequestBodyShape } from "@fern-ui/app-utils";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { FernCard } from "../components/FernCard";
import { Callout } from "../mdx/components/Callout";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { PlaygroundRequestFormState } from "./types";

interface PlaygroundEndpointFormProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointFormProps> = ({ endpoint, formState, setFormState }) => {
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
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                body: typeof value === "function" ? value(state.body) : value,
            }));
        },
        [setFormState],
    );

    return (
        <div className="col-span-2 space-y-8 pb-20">
            {endpoint.headers.length > 0 && (
                <div>
                    <div className="mb-4 px-4">
                        <h5 className="t-muted m-0">Headers</h5>
                    </div>
                    <FernCard className="rounded-xl p-4 shadow-sm">
                        <PlaygroundObjectPropertiesForm
                            prefix="header"
                            properties={endpoint.headers}
                            onChange={setHeaders}
                            value={formState?.headers}
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
                            prefix="path"
                            properties={endpoint.pathParameters}
                            onChange={setPathParameters}
                            value={formState?.pathParameters}
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
                            prefix="query"
                            properties={endpoint.queryParameters}
                            onChange={setQueryParameters}
                            value={formState?.queryParameters}
                        />
                    </FernCard>
                </div>
            )}

            {endpoint.requestBody != null &&
                visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                    fileUpload: () => (
                        <div>
                            <div className="mb-4 px-4">
                                <h5 className="t-muted m-0">Body</h5>
                            </div>
                            <FernCard className="rounded-xl p-4 shadow-sm">
                                <Callout intent="warn">File upload is not yet supported.</Callout>
                            </FernCard>
                        </div>
                    ),
                    typeReference: (shape) => {
                        shape = shape.type === "reference" ? shape.shape() : shape;

                        if (shape.type === "object") {
                            return (
                                <div>
                                    <div className="mb-4 px-4">
                                        <h5 className="t-muted m-0">Body Parameters</h5>
                                    </div>
                                    <FernCard className="rounded-xl p-4 shadow-sm">
                                        <PlaygroundObjectPropertiesForm
                                            prefix="body"
                                            properties={shape.properties()}
                                            onChange={setBody}
                                            value={formState?.body}
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
                                            shape={shape.shape}
                                            onChange={setBody}
                                            value={formState?.body}
                                            onlyRequired
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
                                        shape={shape}
                                        onChange={setBody}
                                        value={formState?.body}
                                        onlyRequired
                                    />
                                </FernCard>
                            </div>
                        );
                    },
                })}
        </div>
    );
};
