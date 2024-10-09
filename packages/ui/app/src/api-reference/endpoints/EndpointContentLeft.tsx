import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { camelCase, sortBy, upperFirst } from "lodash-es";
import { memo } from "react";
import { useFeatureFlags } from "../../atoms";
import { Markdown } from "../../mdx/Markdown";
import { mergeEndpointSchemaWithExample } from "../../resolver/SchemaWithExample";
import {
    ResolvedEndpointDefinition,
    ResolvedError,
    ResolvedExampleEndpointCall,
    ResolvedObjectProperty,
    ResolvedTypeDefinition,
    getParameterDescription,
} from "../../resolver/types";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { EndpointError } from "./EndpointError";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointRequestSection } from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";

export interface HoveringProps {
    isHovering: boolean;
}

export declare namespace EndpointContentLeft {
    export interface Props {
        endpoint: ResolvedEndpointDefinition;
        example: ResolvedExampleEndpointCall;
        showErrors: boolean;
        onHoverRequestProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        onHoverResponseProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        selectedError: ResolvedError | undefined;
        setSelectedError: (idx: ResolvedError | undefined) => void;
        contentType: string | undefined;
        setContentType: (contentType: string) => void;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

const REQUEST = ["request"];
const RESPONSE = ["response"];
const REQUEST_PATH = ["request", "path"];
const REQUEST_QUERY = ["request", "query"];
const REQUEST_HEADER = ["request", "header"];
const REQUEST_BODY = ["request", "body"];
const RESPONSE_BODY = ["response", "body"];
const RESPONSE_ERROR = ["response", "error"];

const UnmemoizedEndpointContentLeft: React.FC<EndpointContentLeft.Props> = ({
    endpoint,
    example,
    showErrors,
    onHoverRequestProperty,
    onHoverResponseProperty,
    selectedError,
    setSelectedError,
    // contentType,
    // setContentType,
    types,
}) => {
    const { isAuthEnabledInDocs } = useFeatureFlags();

    let authHeaders: ResolvedObjectProperty | undefined;
    if (endpoint.auth && isAuthEnabledInDocs) {
        authHeaders = visitDiscriminatedUnion(endpoint.auth, "type")._visit<ResolvedObjectProperty>({
            basicAuth: () => {
                return {
                    key: APIV1Read.PropertyKey("Authorization"),
                    description: "Basic authentication of the form Basic <username:password>.",
                    hidden: false,
                    valueShape: {
                        type: "unknown",
                        displayName: "string",
                    },
                    availability: undefined,
                };
            },
            bearerAuth: () => {
                return {
                    key: APIV1Read.PropertyKey("Authorization"),
                    description: "Bearer authentication of the form Bearer <token>, where token is your auth token.",
                    hidden: false,
                    valueShape: {
                        type: "unknown",
                        displayName: "string",
                    },
                    availability: undefined,
                };
            },
            header: (value) => {
                return {
                    key: APIV1Read.PropertyKey(value.headerWireValue),
                    description:
                        value.prefix != null ? `Header authentication of the form ${value.prefix} <token>` : undefined,
                    hidden: false,
                    valueShape: {
                        type: "unknown",
                        displayName: "string",
                    },
                    availability: undefined,
                };
            },
            oAuth: (value) => {
                return visitDiscriminatedUnion(value.value, "type")._visit({
                    clientCredentials: (clientCredentialsValue) =>
                        visitDiscriminatedUnion(clientCredentialsValue.value, "type")._visit({
                            referencedEndpoint: () => ({
                                key: APIV1Read.PropertyKey("Authorization"),
                                description: "OAuth authentication of the form Bearer <token>.",
                                hidden: false,
                                valueShape: {
                                    type: "unknown",
                                    displayName: "string",
                                },
                                availability: undefined,
                            }),
                        }),
                });
            },
        });
    }

    let headers = endpoint.headers.filter((header) => !header.hidden);

    if (authHeaders) {
        headers = [authHeaders, ...headers];
    }

    return (
        <div className="flex max-w-full flex-1 flex-col gap-12">
            <Markdown className="text-base leading-6" mdx={endpoint.description} />
            {endpoint.pathParameters.length > 0 && (
                <EndpointSection title="Path parameters" anchorIdParts={REQUEST_PATH} slug={endpoint.slug}>
                    <div>
                        {endpoint.pathParameters.map((parameter) => (
                            <div key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={[...REQUEST_PATH, parameter.key]}
                                    slug={endpoint.slug}
                                    description={getParameterDescription(parameter, types)}
                                    availability={parameter.availability}
                                    types={types}
                                />
                            </div>
                        ))}
                    </div>
                </EndpointSection>
            )}
            {headers.length > 0 && (
                <EndpointSection title="Headers" anchorIdParts={REQUEST_HEADER} slug={endpoint.slug}>
                    <div>
                        {headers.map((parameter) => {
                            let isAuth = false;
                            const auth = endpoint.auth;
                            if (
                                (auth?.type === "header" && parameter.key === auth?.headerWireValue) ||
                                parameter.key === "Authorization"
                            ) {
                                isAuth = true;
                            }

                            return (
                                <div key={parameter.key} className="relative">
                                    {isAuth && (
                                        <div className="absolute right-0 top-3">
                                            <div className="px-2 bg-tag-danger rounded-xl flex items-center h-5">
                                                <span className="text-xs t-danger">Auth</span>
                                            </div>
                                        </div>
                                    )}
                                    <TypeComponentSeparator />
                                    <EndpointParameter
                                        name={parameter.key}
                                        shape={parameter.valueShape}
                                        anchorIdParts={[...REQUEST_HEADER, parameter.key]}
                                        slug={endpoint.slug}
                                        description={getParameterDescription(parameter, types)}
                                        availability={parameter.availability}
                                        types={types}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </EndpointSection>
            )}
            {endpoint.queryParameters.length > 0 && (
                <EndpointSection title="Query parameters" anchorIdParts={REQUEST_QUERY} slug={endpoint.slug}>
                    <div>
                        {endpoint.queryParameters.map((parameter) => (
                            <div key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={[...REQUEST_QUERY, parameter.key]}
                                    slug={endpoint.slug}
                                    description={getParameterDescription(parameter, types)}
                                    availability={parameter.availability}
                                    types={types}
                                />
                            </div>
                        ))}
                    </div>
                </EndpointSection>
            )}
            {/* {endpoint.requestBody.length > 1 && (
                <Tabs.Root asChild={true} value={contentType} onValueChange={setContentType}>
                    <FernCard className="-mx-4 rounded-xl shadow-sm">
                        <div className="rounded-t-[inherit] bg-tag-default-soft">
                            <div className="mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0] shadow-border-default">
                                <Tabs.List className="flex min-h-10 overflow-x-auto px-4 font-mono">
                                    <div className="mr-2 flex items-center">
                                        <span className="t-muted text-xs font-semibold">Content-Type:</span>
                                    </div>
                                    {endpoint.requestBody.map((requestBody) => (
                                        <Tabs.Trigger
                                            key={requestBody.contentType}
                                            value={requestBody.contentType}
                                            className="group flex min-h-10 cursor-default items-center px-0 py-2 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)] data-[state=active]:shadow-accent"
                                        >
                                            <span className="t-muted rounded px-2 py-1 text-xs group-data-[state=active]:t-default group-hover:bg-tag-default group-data-[state=active]:font-semibold">
                                                {requestBody.contentType}
                                            </span>
                                        </Tabs.Trigger>
                                    ))}
                                </Tabs.List>
                            </div>
                        </div>
                        <div className="p-4">
                            {endpoint.requestBody.map((requestBody) => (
                                <Tabs.Content key={requestBody.contentType} value={requestBody.contentType}>
                                    <EndpointSection
                                        key={requestBody.contentType}
                                        title="Request"
                                        anchorIdParts={REQUEST}
                                        slug={endpoint.slug}
                                    >
                                        <EndpointRequestSection
                                            requestBody={requestBody}
                                            onHoverProperty={onHoverRequestProperty}
                                            anchorIdParts={REQUEST_BODY}
                                            slug={endpoint.slug}
                                            types={types}
                                        />
                                    </EndpointSection>
                                </Tabs.Content>
                            ))}
                        </div>
                    </FernCard>
                </Tabs.Root>
            )} */}
            {endpoint.requestBody != null && (
                <EndpointSection
                    key={endpoint.requestBody.contentType}
                    title="Request"
                    anchorIdParts={REQUEST}
                    slug={endpoint.slug}
                >
                    <EndpointRequestSection
                        requestBody={endpoint.requestBody}
                        onHoverProperty={onHoverRequestProperty}
                        anchorIdParts={REQUEST_BODY}
                        slug={endpoint.slug}
                        types={types}
                    />
                </EndpointSection>
            )}
            {endpoint.responseBody != null && (
                <EndpointSection title="Response" anchorIdParts={RESPONSE} slug={endpoint.slug}>
                    <EndpointResponseSection
                        responseBody={endpoint.responseBody}
                        exampleResponseBody={mergeEndpointSchemaWithExample(endpoint, example).responseBody}
                        onHoverProperty={onHoverResponseProperty}
                        anchorIdParts={RESPONSE_BODY}
                        slug={endpoint.slug}
                        types={types}
                    />
                </EndpointSection>
            )}
            {showErrors && endpoint.errors.length > 0 && (
                <EndpointSection title="Errors" anchorIdParts={RESPONSE_ERROR} slug={endpoint.slug}>
                    <div className="border-default flex flex-col overflow-visible rounded-lg border">
                        {sortBy(
                            endpoint.errors,
                            (e) => e.statusCode,
                            (e) => e.name,
                        ).map((error, idx) => {
                            return (
                                <EndpointError
                                    key={idx}
                                    error={error}
                                    isFirst={idx === 0}
                                    isLast={idx === endpoint.errors.length - 1}
                                    isSelected={selectedError != null && isErrorEqual(error, selectedError)}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedError(error);
                                    }}
                                    onHoverProperty={onHoverResponseProperty}
                                    anchorIdParts={[
                                        ...RESPONSE_ERROR,
                                        `${convertNameToAnchorPart(error.name) ?? error.statusCode}`,
                                    ]}
                                    slug={endpoint.slug}
                                    availability={error.availability}
                                    types={types}
                                />
                            );
                        })}
                    </div>
                </EndpointSection>
            )}
        </div>
    );
};

export const EndpointContentLeft = memo(UnmemoizedEndpointContentLeft);

function isErrorEqual(a: ResolvedError, b: ResolvedError): boolean {
    return (
        a.statusCode === b.statusCode &&
        (a.name != null && b.name != null ? a.name === b.name : a.name == null && b.name == null)
    );
}

export function convertNameToAnchorPart(name: string | null | undefined): string | undefined {
    if (name == null) {
        return undefined;
    }
    return upperFirst(camelCase(name));
}
