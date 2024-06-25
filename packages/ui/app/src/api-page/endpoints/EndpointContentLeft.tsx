import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { camelCase, sortBy, upperFirst } from "lodash-es";
import { memo } from "react";
import {
    ResolvedEndpointDefinition,
    ResolvedError,
    ResolvedHttpRequestBodyShape,
    ResolvedHttpResponseBodyShape,
    ResolvedTypeDefinition,
    dereferenceObjectProperties,
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
    showErrors,
    onHoverRequestProperty,
    onHoverResponseProperty,
    selectedError,
    setSelectedError,
    // contentType,
    // setContentType,
    types,
}) => {
    const requestExpandAll = useBooleanState(false);
    const responseExpandAll = useBooleanState(false);
    const errorExpandAll = useBooleanState(false);

    const headers = endpoint.headers.filter((header) => !header.hidden);

    return (
        <div className="flex max-w-full flex-1 flex-col  gap-12">
            {endpoint.pathParameters.length > 0 && (
                <EndpointSection title="Path parameters" anchorIdParts={REQUEST_PATH} route={"/" + endpoint.slug}>
                    <div>
                        {endpoint.pathParameters.map((parameter) => (
                            <div key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={[...REQUEST_PATH, parameter.key]}
                                    route={"/" + endpoint.slug}
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
                <EndpointSection title="Headers" anchorIdParts={REQUEST_HEADER} route={"/" + endpoint.slug}>
                    <div>
                        {headers.map((parameter) => (
                            <div key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={[...REQUEST_HEADER, parameter.key]}
                                    route={"/" + endpoint.slug}
                                    description={getParameterDescription(parameter, types)}
                                    availability={parameter.availability}
                                    types={types}
                                />
                            </div>
                        ))}
                    </div>
                </EndpointSection>
            )}
            {endpoint.queryParameters.length > 0 && (
                <EndpointSection title="Query parameters" anchorIdParts={REQUEST_QUERY} route={"/" + endpoint.slug}>
                    <div>
                        {endpoint.queryParameters.map((parameter) => (
                            <div key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={[...REQUEST_QUERY, parameter.key]}
                                    route={"/" + endpoint.slug}
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
                    <FernCard className="-mx-4 rounded-lg shadow-sm">
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
                                        route={"/" + endpoint.slug}
                                        expandAll={requestExpandAll.setTrue}
                                        collapseAll={requestExpandAll.setFalse}
                                        showExpandCollapse={shouldShowExpandCollapse(requestBody.shape, types)}
                                    >
                                        <EndpointRequestSection
                                            requestBody={requestBody}
                                            onHoverProperty={onHoverRequestProperty}
                                            anchorIdParts={REQUEST_BODY}
                                            route={"/" + endpoint.slug}
                                            defaultExpandAll={requestExpandAll.value}
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
                    route={"/" + endpoint.slug}
                    expandAll={requestExpandAll.setTrue}
                    collapseAll={requestExpandAll.setFalse}
                    showExpandCollapse={shouldShowExpandCollapse(endpoint.requestBody.shape, types)}
                >
                    <EndpointRequestSection
                        requestBody={endpoint.requestBody}
                        onHoverProperty={onHoverRequestProperty}
                        anchorIdParts={REQUEST_BODY}
                        route={"/" + endpoint.slug}
                        defaultExpandAll={requestExpandAll.value}
                        types={types}
                    />
                </EndpointSection>
            )}
            {endpoint.responseBody != null && (
                <EndpointSection
                    title="Response"
                    anchorIdParts={RESPONSE}
                    route={"/" + endpoint.slug}
                    expandAll={responseExpandAll.setTrue}
                    collapseAll={responseExpandAll.setFalse}
                    showExpandCollapse={shouldShowExpandCollapse(endpoint.responseBody.shape, types)}
                >
                    <EndpointResponseSection
                        responseBody={endpoint.responseBody}
                        onHoverProperty={onHoverResponseProperty}
                        anchorIdParts={RESPONSE_BODY}
                        route={"/" + endpoint.slug}
                        defaultExpandAll={responseExpandAll.value}
                        types={types}
                    />
                </EndpointSection>
            )}
            {showErrors && endpoint.errors.length > 0 && (
                <EndpointSection
                    title="Errors"
                    anchorIdParts={RESPONSE_ERROR}
                    route={"/" + endpoint.slug}
                    expandAll={errorExpandAll.setTrue}
                    collapseAll={errorExpandAll.setFalse}
                    showExpandCollapse={false}
                >
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
                                    route={"/" + endpoint.slug}
                                    availability={error.availability}
                                    defaultExpandAll={errorExpandAll.value}
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

function shouldShowExpandCollapse(
    shape: ResolvedHttpRequestBodyShape | ResolvedHttpResponseBodyShape,
    types: Record<string, ResolvedTypeDefinition>,
    depth = 0,
): boolean {
    return visitDiscriminatedUnion(shape, "type")._visit({
        primitive: () => false,
        literal: () => false,
        object: (object) =>
            depth > 1
                ? true
                : dereferenceObjectProperties(object, types).some(({ valueShape }) =>
                      shouldShowExpandCollapse(valueShape, types, depth + 1),
                  ),
        map: () => true,
        undiscriminatedUnion: () => true,
        discriminatedUnion: () => true,
        enum: () => false,
        alias: ({ shape }) => shouldShowExpandCollapse(shape, types, depth),
        unknown: () => false,
        formData: () => false,
        optional: ({ shape }) => shouldShowExpandCollapse(shape, types, depth),
        list: ({ shape }) => shouldShowExpandCollapse(shape, types, depth),
        set: ({ shape }) => shouldShowExpandCollapse(shape, types, depth),
        reference: ({ typeId }) => {
            const referenceShape = types[typeId];
            if (referenceShape == null) {
                return false;
            }
            return shouldShowExpandCollapse(referenceShape, types, depth);
        },
        _other: () => false,
        fileDownload: () => false,
        streamingText: () => false,
        streamCondition: () => false,
        bytes: () => false,
        stream: (stream) => {
            return shouldShowExpandCollapse(stream.value, types, depth);
        },
    });
}
