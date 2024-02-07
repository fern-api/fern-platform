import { Button, Checkbox, InputGroup } from "@blueprintjs/core";
import { isApiNode, joinUrlSlugs } from "@fern-api/fdr-sdk";
import {
    ResolvedEndpointDefinition,
    ResolvedHttpRequestBodyShape,
    ResolvedNavigationItemApiSection,
    ResolvedTypeReference,
    titleCase,
    visitResolvedHttpRequestBodyShape,
} from "@fern-ui/app-utils";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { ArrowTopRightIcon, Cross1Icon, GlobeIcon, PersonIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { isUndefined } from "lodash-es";
import Link from "next/link";
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Markdown } from "../api-page/markdown/Markdown";
import { FernCollapse } from "../components/FernCollapse";
import { useNavigationContext } from "../navigation-context";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { SecretBearer, SecretSpan } from "./PlaygroundSecretsModal";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { PlaygroundRequestFormAuth, PlaygroundRequestFormState } from "./types";
import { getDefaultValueForType } from "./utils";

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

    const bodyObjectSections = useMemo(() => {
        if (endpoint.requestBody == null) {
            return [];
        }

        function getObject(
            typeShape: ResolvedHttpRequestBodyShape,
        ): { key: string; valueShape: ResolvedTypeReference }[] {
            if (typeShape.type === "object") {
                return typeShape.properties().filter((property) => property.valueShape.type === "object");
            }

            if (typeShape.type === "reference") {
                return getObject(typeShape.shape());
            }
            return [];
        }

        return getObject(endpoint.requestBody.shape);
    }, [endpoint.requestBody]);

    const optionalBodyObjectSections = useMemo(() => {
        if (endpoint.requestBody == null) {
            return [];
        }

        function getObject(
            typeShape: ResolvedHttpRequestBodyShape,
        ): { key: string; valueShape: ResolvedTypeReference }[] {
            if (typeShape.type === "object") {
                return typeShape
                    .properties()
                    .filter(
                        (property) =>
                            property.valueShape.type === "optional" && property.valueShape.shape.type === "object",
                    );
            }

            if (typeShape.type === "reference") {
                return getObject(typeShape.shape());
            }
            return [];
        }

        return getObject(endpoint.requestBody.shape);
    }, [endpoint.requestBody]);

    return (
        <div className="min-h-0 flex-1 shrink overflow-y-auto overflow-x-hidden">
            <div className="mx-auto my-10 w-full max-w-3xl gap-y-4 p-4 pb-10">
                {endpoint.authed && auth != null && (
                    <section className="bg-tag-danger-light/5 dark:bg-tag-danger-dark/5 border-border-danger-light dark:border-border-danger-dark mb-8 rounded-lg border p-3">
                        <h6 className="t-muted m-0 mb-2">Authorization</h6>
                        <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark list-none divide-y border-t">
                            {visitDiscriminatedUnion(auth, "type")._visit({
                                bearerAuth: (bearerAuth) => (
                                    <li>
                                        <label className="inline-flex flex-wrap items-baseline py-2">
                                            <span className="font-mono text-sm">
                                                {bearerAuth.tokenName ?? "Bearer token"}
                                            </span>
                                        </label>

                                        <div>
                                            {formState?.auth?.type === "bearerAuth" &&
                                            secrets.some(
                                                (secret) =>
                                                    formState?.auth?.type === "bearerAuth" &&
                                                    formState.auth.token === secret.token,
                                            ) ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <SecretSpan secret={formState.auth.token} className="text-sm" />
                                                    <Button
                                                        icon={<Cross1Icon className="size-4" />}
                                                        minimal={true}
                                                        small={true}
                                                        onClick={() => {
                                                            setAuthorization({
                                                                type: "bearerAuth",
                                                                token: "",
                                                            });
                                                        }}
                                                        className="-mr-2"
                                                    />
                                                </span>
                                            ) : (
                                                <PasswordInputGroup
                                                    fill={true}
                                                    onValueChange={(newValue) =>
                                                        setAuthorization({
                                                            type: "bearerAuth",
                                                            token: newValue,
                                                        })
                                                    }
                                                    value={
                                                        formState?.auth?.type === "bearerAuth"
                                                            ? formState.auth.token
                                                            : ""
                                                    }
                                                    autoComplete="off"
                                                    data-1p-ignore="true"
                                                    rightElement={
                                                        <Button
                                                            onClick={openSecretsModal}
                                                            icon={<GlobeIcon className="size-4" />}
                                                            minimal={true}
                                                        />
                                                    }
                                                />
                                            )}
                                        </div>
                                    </li>
                                ),
                                basicAuth: (basicAuth) => (
                                    <>
                                        <li>
                                            <label className="inline-flex flex-wrap items-baseline py-2">
                                                <span className="font-mono text-sm">
                                                    {basicAuth.usernameName ?? "Username"}
                                                </span>
                                            </label>
                                            <div>
                                                <InputGroup
                                                    fill={true}
                                                    onValueChange={(newValue) =>
                                                        setAuthorization({
                                                            type: "basicAuth",
                                                            username: newValue,
                                                            password:
                                                                formState?.auth?.type === "basicAuth"
                                                                    ? formState.auth.password
                                                                    : "",
                                                        })
                                                    }
                                                    value={
                                                        formState?.auth?.type === "basicAuth"
                                                            ? formState.auth.username
                                                            : ""
                                                    }
                                                    leftIcon={<PersonIcon className="size-4" />}
                                                    rightElement={<span className="t-muted text-xs">{"string"}</span>}
                                                />
                                            </div>
                                        </li>

                                        <li>
                                            <label className="inline-flex flex-wrap items-baseline py-2">
                                                <span className="font-mono text-sm">
                                                    {basicAuth.passwordName ?? "Password"}
                                                </span>
                                            </label>

                                            <div>
                                                <PasswordInputGroup
                                                    fill={true}
                                                    onValueChange={(newValue) =>
                                                        setAuthorization({
                                                            type: "basicAuth",
                                                            username:
                                                                formState?.auth?.type === "basicAuth"
                                                                    ? formState.auth.username
                                                                    : "",
                                                            password: newValue,
                                                        })
                                                    }
                                                    value={
                                                        formState?.auth?.type === "basicAuth"
                                                            ? formState.auth.password
                                                            : ""
                                                    }
                                                />
                                            </div>
                                        </li>
                                    </>
                                ),
                                header: (header) => (
                                    <li>
                                        <label className="inline-flex flex-wrap items-baseline py-2">
                                            <span className="font-mono text-sm">
                                                {header.nameOverride ?? header.headerWireValue}
                                            </span>
                                        </label>
                                        <div>
                                            <PasswordInputGroup
                                                fill={true}
                                                onValueChange={(newValue) =>
                                                    setAuthorization({
                                                        type: "header",
                                                        headers: { [header.headerWireValue]: newValue },
                                                    })
                                                }
                                                value={
                                                    formState?.auth?.type === "header"
                                                        ? formState.auth.headers[header.headerWireValue]
                                                        : ""
                                                }
                                                autoComplete="off"
                                                data-1p-ignore="true"
                                            />
                                        </div>
                                    </li>
                                ),
                                _other: () => null,
                            })}
                        </ul>
                    </section>
                )}

                <div className="divide-border-default-light dark:divide-border-default-dark flex divide-x">
                    <aside className="w-48 pr-4">
                        {endpoint.headers.length > 0 && (
                            <div className="mb-4">
                                <h6 className="t-muted m-0 mb-2 text-xs">Headers</h6>
                                <ul className="-mx-3 list-none">
                                    {endpoint.headers.map((param) => (
                                        <li key={param.key}>
                                            <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                {param.key}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {endpoint.pathParameters.length > 0 && (
                            <div className="mb-4">
                                <h6 className="t-muted m-0 mb-2 text-xs">Path Parameters</h6>
                                <ul className="-mx-3 list-none">
                                    {endpoint.pathParameters.map((param) => (
                                        <li key={param.key}>
                                            <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                {param.key}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {endpoint.queryParameters.length > 0 && (
                            <div className="mb-4">
                                <h6 className="t-muted m-0 mb-2 text-xs">Query Parameters</h6>
                                <ul className="-mx-3 list-none">
                                    {endpoint.queryParameters.map((param) => (
                                        <li key={param.key}>
                                            <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                {param.key}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {bodyObjectSections.map((section) => (
                            <div key={section.key} className="mb-4 px-3">
                                <h6 className="t-muted m-0 mb-2">{titleCase(section.key)}</h6>
                                <ul className="-mx-3 list-none">
                                    {section.valueShape.type === "object" &&
                                        section.valueShape.properties().map((param) => (
                                            <li key={param.key}>
                                                <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                    {param.key}
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}

                        {endpoint.requestBody != null && hasRequiredFields(endpoint.requestBody.shape) && (
                            <div className="mb-4">
                                <h6 className="t-muted m-0 mb-2 text-xs">Required Body Parameters</h6>

                                <ul className="-mx-3 list-none">
                                    {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                                        fileUpload: () => null,
                                        typeReference: (shape) =>
                                            shape.type === "object" ? (
                                                shape.properties().map((param) =>
                                                    param.valueShape.type !== "optional" ? (
                                                        <li key={param.key}>
                                                            <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                                {param.key}
                                                            </button>
                                                        </li>
                                                    ) : null,
                                                )
                                            ) : (
                                                <li>
                                                    <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                        Value
                                                    </button>
                                                </li>
                                            ),
                                    })}
                                </ul>
                            </div>
                        )}

                        {optionalBodyObjectSections.map((section) => (
                            <div key={section.key} className="mb-4">
                                <h6 className="t-muted m-0 mb-2 text-xs">{titleCase(section.key)}</h6>
                                <ul className="-mx-3 list-none">
                                    {section.valueShape.type === "object" &&
                                        section.valueShape.properties().map((param) => (
                                            <li key={param.key}>
                                                <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                    {param.key}
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}

                        {endpoint.requestBody != null && hasOptionalFields(endpoint.requestBody.shape) && (
                            <div className="mb-4">
                                <h6 className="t-muted m-0 mb-2 text-xs">Optional Body Parameters</h6>

                                <ul className="-mx-3 list-none">
                                    {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                                        fileUpload: () => null,
                                        typeReference: (shape) =>
                                            shape.type === "object"
                                                ? shape.properties().map((param) =>
                                                      param.valueShape.type === "optional" ? (
                                                          <li key={param.key}>
                                                              <button className="hover:bg-tag-default-light dark:hover:bg-tag-default-dark h-8 w-full truncate rounded px-3 py-2 text-left font-mono text-sm leading-none">
                                                                  {param.key}
                                                              </button>
                                                          </li>
                                                      ) : undefined,
                                                  )
                                                : null,
                                    })}
                                </ul>
                            </div>
                        )}
                    </aside>
                    <div className="flex-1 pl-4">
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
                                        <a className="text-accent-primary dark:text-accent-primary-dark text-xs">
                                            {showFullDescription ? "Show less" : "Show more"}
                                        </a>
                                    </div>
                                )}
                            </section>
                        )}

                        {endpoint.headers.length > 0 && (
                            <section className="mb-8">
                                <h6 className="t-muted m-0 mb-2">Headers</h6>
                                <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark list-none divide-y border-y">
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
                                <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark list-none divide-y border-y">
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
                                <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark list-none divide-y border-y">
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

                        {bodyObjectSections.map((section) => (
                            <section key={section.key} className="mb-8">
                                <h6 className="t-muted m-0 mb-2">{titleCase(section.key)}</h6>
                                <PlaygroundTypeReferenceForm
                                    shape={section.valueShape}
                                    onChange={(value) => {
                                        setBody((oldBody: Record<string, unknown>) => ({
                                            ...oldBody,
                                            [section.key]:
                                                typeof value === "function" ? value(oldBody[section.key]) : value,
                                        }));
                                    }}
                                    value={
                                        formState != null && isPlainObject(formState.body)
                                            ? formState.body[section.key] ?? {}
                                            : {}
                                    }
                                />
                            </section>
                        ))}

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
                                            hideObjects
                                            sortProperties
                                        />
                                    ),
                                })}
                            </section>
                        )}

                        {optionalBodyObjectSections.map((section) => {
                            const unwrappedShape =
                                section.valueShape.type === "optional" ? section.valueShape.shape : section.valueShape;
                            const value =
                                formState != null && isPlainObject(formState.body)
                                    ? formState.body[section.key]
                                    : undefined;
                            const handleChange = (value: unknown) => {
                                setBody((oldBody: Record<string, unknown>) => ({
                                    ...oldBody,
                                    [section.key]: typeof value === "function" ? value(oldBody[section.key]) : value,
                                }));
                            };
                            return (
                                <section key={section.key} className="mb-8">
                                    <div className="flex items-center justify-between">
                                        <h6 className="t-muted m-0 mb-2">{titleCase(section.key)}</h6>
                                        <Checkbox
                                            checked={!isUndefined(value)}
                                            onChange={(e) => {
                                                handleChange(
                                                    e.target.checked
                                                        ? getDefaultValueForType(unwrappedShape)
                                                        : undefined,
                                                );
                                            }}
                                            className="!-my-2 !-mr-2"
                                        />
                                    </div>
                                    <FernCollapse isOpen={!isUndefined(value)}>
                                        <PlaygroundTypeReferenceForm
                                            shape={unwrappedShape}
                                            onChange={handleChange}
                                            value={
                                                formState != null && isPlainObject(formState.body)
                                                    ? formState.body[section.key]
                                                    : undefined
                                            }
                                        />
                                    </FernCollapse>
                                </section>
                            );
                        })}

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
                                            hideObjects
                                            sortProperties
                                        />
                                    ),
                                })}
                            </section>
                        )}

                        <Link
                            href={`/${joinUrlSlugs(...endpoint.slug)}`}
                            shallow={
                                isApiNode(activeNavigatable) && activeNavigatable.section.api === endpoint.apiSectionId
                            }
                            className="t-muted hover:text-accent-primary hover:dark:text-accent-primary-dark inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
                        >
                            <span>View in API Reference</span>
                            <ArrowTopRightIcon className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
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
