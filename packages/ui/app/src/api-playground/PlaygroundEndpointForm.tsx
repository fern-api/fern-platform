import { Button, InputGroup } from "@blueprintjs/core";
import { ArrowTopRight, Cross, GlobeNetwork, Person } from "@blueprintjs/icons";
import { isApiNode, joinUrlSlugs } from "@fern-api/fdr-sdk";
import {
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
    visitResolvedHttpRequestBodyShape,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import Link from "next/link";
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Markdown } from "../api-page/markdown/Markdown";
import { useNavigationContext } from "../navigation-context";
import { PasswordInputGroup } from "./PasswordInputGroup";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { SecretBearer, SecretSpan } from "./PlaygroundSecretsModal";
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
        [setFormState]
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
        <div className="flex min-h-0 flex-1 shrink flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-4 pb-10">
            {endpoint.description != null && endpoint.description.length > 0 && (
                <section
                    className="border-border-default-light dark:border-border-default-dark border-b pb-4"
                    onClick={toggleShowFullDescription}
                >
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

            {endpoint.authed && auth != null && (
                <section>
                    <h6 className="t-muted m-0 mb-2">Authorization</h6>
                    <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark -mx-4 mb-4 list-none divide-y border-y">
                        {visitDiscriminatedUnion(auth, "type")._visit({
                            bearerAuth: (bearerAuth) => (
                                <li className="divide-border-default-light dark:divide-border-default-dark flex min-h-12 flex-row items-stretch divide-x px-4">
                                    <div className="flex min-w-0 flex-1 shrink items-center justify-between gap-2 pr-2">
                                        <label className="inline-flex flex-wrap items-baseline gap-2">
                                            <span className="font-mono text-sm">
                                                {bearerAuth.tokenName ?? "Bearer token"}
                                            </span>
                                        </label>
                                    </div>
                                    <div className="flex min-w-0 max-w-full flex-1 shrink items-center justify-end gap-2 pl-2">
                                        {formState?.auth?.type === "bearerAuth" &&
                                        secrets.some(
                                            (secret) =>
                                                formState?.auth?.type === "bearerAuth" &&
                                                formState.auth.token === secret.token
                                        ) ? (
                                            <span className="inline-flex items-center gap-1">
                                                <SecretSpan secret={formState.auth.token} className="text-sm" />
                                                <Button
                                                    icon={<Cross />}
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
                                                    setAuthorization({ type: "bearerAuth", token: newValue })
                                                }
                                                value={
                                                    formState?.auth?.type === "bearerAuth" ? formState.auth.token : ""
                                                }
                                                autoComplete="off"
                                                data-1p-ignore="true"
                                                rightElement={
                                                    <Button
                                                        onClick={openSecretsModal}
                                                        icon={<GlobeNetwork />}
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
                                    <li className="divide-border-default-light dark:divide-border-default-dark flex min-h-12 flex-row items-stretch divide-x px-4">
                                        <div className="flex min-w-0 flex-1 shrink items-center justify-between gap-2 pr-2">
                                            <label className="inline-flex flex-wrap items-baseline gap-2">
                                                <span className="font-mono text-sm">
                                                    {basicAuth.usernameName ?? "Username"}
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex min-w-0 max-w-full flex-1 shrink items-center justify-end gap-2 pl-2">
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
                                                    formState?.auth?.type === "basicAuth" ? formState.auth.username : ""
                                                }
                                                leftIcon={<Person />}
                                                rightElement={<span className="t-muted text-xs">{"string"}</span>}
                                            />
                                        </div>
                                    </li>

                                    <li className="divide-border-default-light dark:divide-border-default-dark flex min-h-12 flex-row items-stretch divide-x px-4">
                                        <div className="flex min-w-0 flex-1 shrink items-center justify-between gap-2 pr-2">
                                            <label className="inline-flex flex-wrap items-baseline gap-2">
                                                <span className="font-mono text-sm">
                                                    {basicAuth.passwordName ?? "Password"}
                                                </span>
                                            </label>
                                        </div>

                                        <div className="flex min-w-0 flex-1 shrink justify-between gap-2 pl-2">
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
                                                    formState?.auth?.type === "basicAuth" ? formState.auth.password : ""
                                                }
                                            />
                                        </div>
                                    </li>
                                </>
                            ),
                            header: (header) => (
                                <li className="divide-border-default-light dark:divide-border-default-dark flex min-h-12 flex-row items-stretch divide-x px-4">
                                    <div className="flex min-w-0 flex-1 shrink items-center justify-between gap-2">
                                        <label className="inline-flex flex-wrap items-baseline gap-2">
                                            <span className="font-mono text-sm">
                                                {header.nameOverride ?? header.headerWireValue}
                                            </span>
                                        </label>
                                    </div>
                                    <div className="flex min-w-0 flex-1 shrink justify-between gap-2 pl-2">
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

            {endpoint.headers.length > 0 && (
                <section>
                    <h6 className="t-muted m-0 mb-2">Headers</h6>
                    <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark -mx-4 mb-4 list-none divide-y border-y">
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
                <section>
                    <h6 className="t-muted m-0 mb-2">Path parameters</h6>
                    <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark -mx-4 mb-4 list-none divide-y border-y">
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
                <section>
                    <h6 className="t-muted m-0 mb-2">Query parameters</h6>
                    <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark -mx-4 mb-4 list-none divide-y border-y">
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

            {endpoint.requestBody != null && (
                <section>
                    <h6 className="t-muted m-0 mb-2">Body</h6>

                    {visitResolvedHttpRequestBodyShape(endpoint.requestBody.shape, {
                        fileUpload: () => <span>fileUpload</span>,
                        typeReference: (shape) => (
                            <PlaygroundTypeReferenceForm shape={shape} onChange={setBody} value={formState?.body} />
                        ),
                    })}
                </section>
            )}

            <Link
                href={`/${joinUrlSlugs(...endpoint.slug)}`}
                shallow={isApiNode(activeNavigatable) && activeNavigatable.section.api === endpoint.apiSectionId}
                className="t-muted hover:text-accent-primary hover:dark:text-accent-primary-dark inline-flex items-center gap-2 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
            >
                <span>View in API Reference</span>
                <ArrowTopRight />
            </Link>
        </div>
    );
};
