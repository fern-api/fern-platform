import { InputGroup } from "@blueprintjs/core";
import { Key } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { Markdown } from "../api-page/markdown/Markdown";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
import styles from "./PlaygroundEndpointForm.module.scss";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { PlaygroundRequestFormState } from "./types";
import { castToRecord, unknownToString } from "./utils";

interface PlaygroundEndpointForm {
    endpoint: APIV1Read.EndpointDefinition;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointForm> = ({ endpoint, formState, setFormState }) => {
    const { resolveTypeById } = useApiDefinitionContext();
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
        [setFormState]
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
        [setFormState]
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
        [setFormState]
    );

    const setBody = useCallback(
        (value: ((old: unknown) => unknown) | unknown) => {
            setFormState((state) => ({
                ...state,
                body: typeof value === "function" ? value(state.body) : value,
            }));
        },
        [setFormState]
    );

    const setBodyByKey = useCallback(
        (key: string, value: unknown) => {
            setBody((bodyState: unknown) => {
                const oldBody = castToRecord(bodyState);
                return {
                    ...oldBody,
                    [key]: typeof value === "function" ? value(oldBody[key]) : value,
                };
            });
        },
        [setBody]
    );

    const descriptionRef = useRef<HTMLDivElement>(null);
    const { value: showFullDescription, toggleValue: toggleShowFullDescription } = useBooleanState(false);
    const [descriptionIsClamped, setDescriptionIsClamped] = useState(false);

    useEffect(() => {
        const descriptionResizeObserver = new ResizeObserver(([e]) => {
            if (e != null && !showFullDescription) {
                setDescriptionIsClamped(e.target.scrollHeight > e.target.clientHeight);
            }
        });

        if (descriptionRef.current != null) {
            descriptionResizeObserver.observe(descriptionRef.current);
            return () => {
                descriptionResizeObserver.disconnect();
            };
        }
        return undefined;
    }, [showFullDescription]);

    return (
        <div className="flex w-full flex-1 flex-col gap-y-4 overflow-y-auto overflow-x-hidden px-6 py-4 pb-10">
            {endpoint.description != null && endpoint.description.length > 0 && (
                <section
                    className="border-border-default-light dark:border-border-default-dark border-b pb-4"
                    onClick={toggleShowFullDescription}
                >
                    <div
                        className={classNames("text-sm", {
                            [styles.descriptionMask]: !showFullDescription,
                        })}
                        ref={descriptionRef}
                    >
                        <Markdown>{endpoint.description}</Markdown>
                    </div>
                    {descriptionIsClamped && (
                        <div>
                            <a className="text-accent-primary dark:text-accent-primary-dark text-xs">
                                {showFullDescription ? "Show less" : "Show more"}
                            </a>
                        </div>
                    )}
                </section>
            )}

            {endpoint.authed && (
                <section>
                    <h3 className="m-0">Authorization</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        <li className="flex flex-col gap-1">
                            <div className="shrink-1 flex min-w-0 flex-1 items-center justify-between gap-2">
                                <label className="inline-flex w-full flex-wrap items-baseline gap-2">
                                    <span className="font-mono text-sm">{"Authorization"}</span>

                                    <span className="t-muted text-xs">{"string"}</span>
                                </label>
                            </div>
                            <InputGroup
                                fill={true}
                                type="password"
                                onValueChange={(newValue) => setHeader("Authorization", `Bearer ${newValue}`)}
                                value={unknownToString(formState.headers["Authorization"]).replace(/^Bearer /, "")}
                                leftIcon={<Key />}
                                autoComplete="off"
                                data-1p-ignore="true"
                            />
                        </li>
                    </ul>
                </section>
            )}

            {endpoint.headers.length > 0 && (
                <section>
                    <h3 className="m-0">Headers</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        {endpoint.headers.map((header) => (
                            <PlaygroundObjectPropertyForm
                                key={header.key}
                                property={{
                                    key: header.key,
                                    valueType: header.type,
                                    description: header.description,
                                    descriptionContainsMarkdown: header.descriptionContainsMarkdown,
                                    htmlDescription: header.htmlDescription,
                                    availability: header.availability,
                                }}
                                onChange={setHeader}
                                value={formState.headers[header.key]}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {endpoint.path.pathParameters.length > 0 && (
                <section>
                    <h3 className="m-0">Path parameters</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        {endpoint.path.pathParameters.map((pathParameter) => (
                            <PlaygroundObjectPropertyForm
                                key={pathParameter.key}
                                property={{
                                    key: pathParameter.key,
                                    valueType: pathParameter.type,
                                    description: pathParameter.description,
                                    descriptionContainsMarkdown: pathParameter.descriptionContainsMarkdown,
                                    htmlDescription: pathParameter.htmlDescription,
                                    availability: pathParameter.availability,
                                }}
                                onChange={setPathParameter}
                                value={formState.pathParameters[pathParameter.key]}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {endpoint.queryParameters.length > 0 && (
                <section>
                    <h3 className="m-0">Query parameters</h3>
                    <ul className="my-4 w-full list-none space-y-4">
                        {endpoint.queryParameters.map((queryParameter) => (
                            <PlaygroundObjectPropertyForm
                                key={queryParameter.key}
                                property={{
                                    key: queryParameter.key,
                                    valueType: queryParameter.type,
                                    description: queryParameter.description,
                                    descriptionContainsMarkdown: queryParameter.descriptionContainsMarkdown,
                                    htmlDescription: queryParameter.htmlDescription,
                                    availability: queryParameter.availability,
                                }}
                                onChange={setQueryParameter}
                                value={formState.queryParameters[queryParameter.key]}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {endpoint.request != null && (
                <section>
                    <h3 className="m-0">Body</h3>

                    {visitDiscriminatedUnion(endpoint.request.type, "type")._visit({
                        object: (object) => (
                            <ul className="my-4 w-full list-none space-y-6">
                                {getAllObjectProperties(object, resolveTypeById).map((property) => (
                                    <PlaygroundObjectPropertyForm
                                        key={property.key}
                                        property={property}
                                        onChange={setBodyByKey}
                                        value={castToRecord(formState.body)[property.key]}
                                    />
                                ))}
                            </ul>
                        ),
                        reference: (reference) => (
                            <PlaygroundTypeReferenceForm
                                typeReference={reference.value}
                                doNotNest
                                onChange={setBody}
                                value={formState.body}
                            />
                        ),
                        fileUpload: () => <span>fileUpload</span>,
                        _other: () => null,
                    })}
                </section>
            )}
        </div>
    );
};
