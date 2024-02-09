import { ResolvedEndpointDefinition, visitResolvedHttpRequestBodyShape } from "@fern-ui/app-utils";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { FernCard } from "../components/FernCard";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { PlaygroundRequestFormState } from "./types";
import { hasOptionalFields, hasRequiredFields } from "./utils";

interface PlaygroundEndpointFormProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointFormProps> = ({ endpoint, formState, setFormState }) => {
    const setHeader = useCallback(
        (key: string, value: unknown) => {
            setFormState((state) => ({
                ...state,
                headers: {
                    ...state.headers,
                    [key]: typeof value === "function" ? value(state.headers[key]) : value,
                },
            }));
        },
        [setFormState],
    );

    const setPathParameter = useCallback(
        (key: string, value: unknown) => {
            setFormState((state) => ({
                ...state,
                pathParameters: {
                    ...state.pathParameters,
                    [key]: typeof value === "function" ? value(state.pathParameters[key]) : value,
                },
            }));
        },
        [setFormState],
    );

    const setQueryParameter = useCallback(
        (key: string, value: unknown) => {
            setFormState((state) => ({
                ...state,
                queryParameters: {
                    ...state.queryParameters,
                    [key]: typeof value === "function" ? value(state.queryParameters[key]) : value,
                },
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
                <FernCard className="divide-border-default divide-y rounded-xl shadow-sm">
                    <div className="p-4">
                        <h5 className="t-muted m-0">Headers</h5>
                    </div>
                    <ul className="divide-border-default list-none divide-y px-4">
                        {endpoint.headers.map((header) => (
                            <PlaygroundObjectPropertyForm
                                key={header.key}
                                property={{
                                    key: header.key,
                                    valueShape: header.shape,
                                    description: header.description,
                                    descriptionContainsMarkdown: header.descriptionContainsMarkdown,
                                    htmlDescription: header.htmlDescription,
                                    availability: header.availability,
                                }}
                                onChange={setHeader}
                                value={formState?.headers[header.key]}
                            />
                        ))}
                    </ul>
                </FernCard>
            )}

            {endpoint.pathParameters.length > 0 && (
                <FernCard className="divide-border-default divide-y rounded-xl shadow-sm">
                    <div className="p-4">
                        <h5 className="t-muted m-0">Path Parameters</h5>
                    </div>
                    <ul className="divide-border-default list-none divide-y px-4">
                        {endpoint.pathParameters.map((pathParameter) => (
                            <PlaygroundObjectPropertyForm
                                key={pathParameter.key}
                                property={{
                                    key: pathParameter.key,
                                    valueShape: pathParameter.shape,
                                    description: pathParameter.description,
                                    descriptionContainsMarkdown: pathParameter.descriptionContainsMarkdown,
                                    htmlDescription: pathParameter.htmlDescription,
                                    availability: pathParameter.availability,
                                }}
                                onChange={setPathParameter}
                                value={formState?.pathParameters[pathParameter.key]}
                            />
                        ))}
                    </ul>
                </FernCard>
            )}

            {endpoint.queryParameters.length > 0 && (
                <FernCard className="divide-border-default divide-y rounded-xl shadow-sm">
                    <div className="p-4">
                        <h5 className="t-muted m-0">Query Parameters</h5>
                    </div>
                    <ul className="divide-border-default list-none divide-y px-4">
                        {endpoint.queryParameters.map((queryParameter) => (
                            <PlaygroundObjectPropertyForm
                                key={queryParameter.key}
                                property={{
                                    key: queryParameter.key,
                                    valueShape: queryParameter.shape,
                                    description: queryParameter.description,
                                    descriptionContainsMarkdown: queryParameter.descriptionContainsMarkdown,
                                    htmlDescription: queryParameter.htmlDescription,
                                    availability: queryParameter.availability,
                                }}
                                onChange={setQueryParameter}
                                value={formState?.queryParameters[queryParameter.key]}
                            />
                        ))}
                    </ul>
                </FernCard>
            )}

            {endpoint.requestBody != null && hasRequiredFields(endpoint.requestBody.shape) && (
                <FernCard className="divide-border-default divide-y rounded-xl shadow-sm">
                    <div className="p-4">
                        <h5 className="t-muted m-0">Body Parameters</h5>
                    </div>

                    {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                        fileUpload: () => <span>fileUpload</span>,
                        typeReference: (shape) => (
                            <PlaygroundTypeReferenceForm
                                shape={shape}
                                onChange={setBody}
                                value={formState?.body}
                                onlyRequired
                                sortProperties
                            />
                        ),
                    })}
                </FernCard>
            )}

            {endpoint.requestBody != null && hasOptionalFields(endpoint.requestBody.shape) && (
                <FernCard className="divide-border-default divide-y rounded-xl shadow-sm">
                    <div className="p-4">
                        <h5 className="t-muted m-0">Additional Body Parameters</h5>
                    </div>

                    {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                        fileUpload: () => <span>fileUpload</span>,
                        typeReference: (shape) => (
                            <PlaygroundTypeReferenceForm
                                shape={shape}
                                onChange={setBody}
                                value={formState?.body}
                                onlyOptional
                                sortProperties
                            />
                        ),
                    })}
                </FernCard>
            )}
        </div>
    );
};
