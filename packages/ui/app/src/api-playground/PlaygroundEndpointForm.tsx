import { isApiNode, joinUrlSlugs } from "@fern-api/fdr-sdk";
import {
    ResolvedEndpointDefinition,
    ResolvedHttpRequestBodyShape,
    ResolvedNavigationItemApiSection,
    visitResolvedHttpRequestBodyShape,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Markdown } from "../api-page/markdown/Markdown";
import { FernButton } from "../components/FernButton";
import { FernScrollArea } from "../components/FernScrollArea";
import { useNavigationContext } from "../navigation-context";
import { PlaygroundAuthorizationForm } from "./PlaygroundAuthorizationForm";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";

interface PlaygroundEndpointFormProps {
    auth: ResolvedNavigationItemApiSection["auth"];
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundRequestFormState | undefined;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
}

export const PlaygroundEndpointForm: FC<PlaygroundEndpointFormProps> = ({
    auth,
    endpoint,
    formState,
    setFormState,
    openSecretsModal,
    secrets,
}) => {
    const { activeNavigatable } = useNavigationContext();
    const setAuthorization = useCallback(
        (newAuthValue: PlaygroundRequestFormAuth) => {
            setFormState((state) => ({
                ...state,
                auth: newAuthValue,
            }));
        },
        [setFormState],
    );

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

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [scrollAreaHeight, setScrollAreaHeight] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined" || scrollAreaRef.current == null) {
            return;
        }
        const resizeObserver = new window.ResizeObserver(([size]) => {
            if (size != null) {
                setScrollAreaHeight(size.contentRect.height);
            }
        });
        resizeObserver.observe(scrollAreaRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <FernScrollArea ref={scrollAreaRef}>
            <div className="mx-auto my-10 w-full max-w-3xl gap-y-4 p-4 pb-10">
                {endpoint.authed && auth != null && (
                    <section className="callout-outlined-ghost-danger mb-8 rounded-xl p-3">
                        <h6 className="t-muted m-0 mb-2">Authorization</h6>
                        <PlaygroundAuthorizationForm
                            auth={auth}
                            value={formState?.auth}
                            onChange={setAuthorization}
                            openSecretsModal={openSecretsModal}
                            secrets={secrets}
                        />
                    </section>
                )}

                <div className="divide-border-default flex items-start divide-x">
                    <aside className="sticky top-0 w-48" style={{ maxHeight: scrollAreaHeight }}>
                        <FernScrollArea>
                            {endpoint.headers.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="t-muted m-0 mx-3 mb-2">Headers</h6>
                                    <ul className="list-none">
                                        {endpoint.headers.map((param) => (
                                            <li key={param.key}>
                                                <FernButton variant="minimal" mono={true} className="w-full text-left">
                                                    {param.key}
                                                </FernButton>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {endpoint.pathParameters.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="t-muted m-0 mx-3 mb-2">Path Parameters</h6>
                                    <ul className="list-none">
                                        {endpoint.pathParameters.map((param) => (
                                            <li key={param.key}>
                                                <FernButton variant="minimal" mono={true} className="w-full text-left">
                                                    {param.key}
                                                </FernButton>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {endpoint.queryParameters.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="t-muted m-0 mx-3 mb-2">Query Parameters</h6>
                                    <ul className="list-none">
                                        {endpoint.queryParameters.map((param) => (
                                            <li key={param.key}>
                                                <FernButton variant="minimal" mono={true} className="w-full text-left">
                                                    {param.key}
                                                </FernButton>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {endpoint.requestBody != null && hasRequiredFields(endpoint.requestBody.shape) && (
                                <div className="mb-4">
                                    <h6 className="t-muted m-0 mx-3 mb-2">Required Body Parameters</h6>

                                    <ul className="list-none">
                                        {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                                            fileUpload: () => null,
                                            typeReference: (shape) =>
                                                shape.type === "object"
                                                    ? shape.properties().map((param) =>
                                                          param.valueShape.type !== "optional" ? (
                                                              <li key={param.key}>
                                                                  <FernButton
                                                                      variant="minimal"
                                                                      mono={true}
                                                                      className="w-full text-left"
                                                                  >
                                                                      {param.key}
                                                                  </FernButton>
                                                              </li>
                                                          ) : null,
                                                      )
                                                    : null,
                                        })}
                                    </ul>
                                </div>
                            )}

                            {endpoint.requestBody != null && hasOptionalFields(endpoint.requestBody.shape) && (
                                <div className="mb-4">
                                    <h6 className="t-muted m-0 mx-3 mb-2">Optional Body Parameters</h6>

                                    <ul className="list-none">
                                        {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                                            fileUpload: () => null,
                                            typeReference: (shape) =>
                                                shape.type === "object"
                                                    ? shape.properties().map((param) =>
                                                          param.valueShape.type === "optional" ? (
                                                              <li key={param.key}>
                                                                  <FernButton
                                                                      variant="minimal"
                                                                      mono={true}
                                                                      className="w-full text-left"
                                                                  >
                                                                      {param.key}
                                                                  </FernButton>
                                                              </li>
                                                          ) : undefined,
                                                      )
                                                    : null,
                                        })}
                                    </ul>
                                </div>
                            )}
                        </FernScrollArea>
                    </aside>
                    <div className="min-w-0 flex-1 shrink pl-4">
                        {endpoint.description != null && endpoint.description.length > 0 && (
                            <section className="pb-8" onClick={toggleShowFullDescription}>
                                <div
                                    className={classNames("text-sm", {
                                        ["description-mask"]: !showFullDescription,
                                    })}
                                    ref={descriptionRef}
                                >
                                    <Markdown>{endpoint.description}</Markdown>
                                </div>
                                {descriptionIsClamped && (
                                    <div>
                                        <a className="t-accent text-xs">
                                            {showFullDescription ? "Show less" : "Show more"}
                                        </a>
                                    </div>
                                )}
                            </section>
                        )}

                        {endpoint.headers.length > 0 && (
                            <section className="mb-8">
                                <h6 className="t-muted m-0 mb-2">Headers</h6>
                                <ul className="divide-border-default border-default list-none divide-y border-y">
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
                            </section>
                        )}

                        {endpoint.pathParameters.length > 0 && (
                            <section className="mb-8">
                                <h6 className="t-muted m-0 mb-2">Path Parameters</h6>
                                <ul className="divide-border-default border-default list-none divide-y border-y">
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
                            </section>
                        )}

                        {endpoint.queryParameters.length > 0 && (
                            <section className="mb-8">
                                <h6 className="t-muted m-0 mb-2">Query Parameters</h6>
                                <ul className="divide-border-default border-default list-none divide-y border-y">
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
                            </section>
                        )}

                        {endpoint.requestBody != null && hasRequiredFields(endpoint.requestBody.shape) && (
                            <section className="mb-8">
                                <h6 className="t-muted m-0 mb-2">Required Body Parameters</h6>

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
                            </section>
                        )}

                        {endpoint.requestBody != null && hasOptionalFields(endpoint.requestBody.shape) && (
                            <section className="mb-8">
                                <h6 className="t-muted m-0 mb-2">Optional Body Parameters</h6>

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
                            </section>
                        )}

                        <Link
                            href={`/${joinUrlSlugs(...endpoint.slug)}`}
                            shallow={
                                activeNavigatable != null &&
                                isApiNode(activeNavigatable) &&
                                activeNavigatable.section.api === endpoint.apiSectionId
                            }
                            className="t-muted hover:t-accent inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
                        >
                            <span>View in API Reference</span>
                            <ArrowTopRightIcon className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </FernScrollArea>
    );
};

function hasRequiredFields(bodyShape: ResolvedHttpRequestBodyShape): boolean {
    return visitResolvedHttpRequestBodyShape(bodyShape, {
        fileUpload: () => true,
        typeReference: (shape) =>
            visitDiscriminatedUnion(shape, "type")._visit({
                string: () => true,
                boolean: () => true,
                object: (object) => object.properties().some((property) => hasRequiredFields(property.valueShape)),
                undiscriminatedUnion: () => true,
                discriminatedUnion: () => true,
                enum: () => true,
                integer: () => true,
                double: () => true,
                long: () => true,
                datetime: () => true,
                uuid: () => true,
                base64: () => true,
                date: () => true,
                optional: () => false,
                list: () => true,
                set: () => true,
                map: () => true,
                booleanLiteral: () => true,
                stringLiteral: () => true,
                unknown: () => true,
                reference: (reference) => hasRequiredFields(reference.shape()),
                _other: () => true,
            }),
    });
}

function hasOptionalFields(bodyShape: ResolvedHttpRequestBodyShape): boolean {
    return visitResolvedHttpRequestBodyShape(bodyShape, {
        fileUpload: () => false,
        typeReference: (shape) =>
            visitDiscriminatedUnion(shape, "type")._visit({
                string: () => false,
                boolean: () => false,
                object: (object) => object.properties().some((property) => hasOptionalFields(property.valueShape)),
                undiscriminatedUnion: () => false,
                discriminatedUnion: () => false,
                enum: () => false,
                integer: () => false,
                double: () => false,
                long: () => false,
                datetime: () => false,
                uuid: () => false,
                base64: () => false,
                date: () => false,
                optional: () => true,
                list: () => false,
                set: () => false,
                map: () => false,
                booleanLiteral: () => false,
                stringLiteral: () => false,
                unknown: () => false,
                reference: (reference) => hasOptionalFields(reference.shape()),
                _other: () => false,
            }),
    });
}
