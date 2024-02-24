import { APIV1Read } from "@fern-api/fdr-sdk";
import { useBooleanState } from "@fern-ui/react-commons";
import * as Tabs from "@radix-ui/react-tabs";
import { camelCase, sortBy, upperFirst } from "lodash-es";
import { memo } from "react";
import { FernCard } from "../../components/FernCard";
import { ResolvedEndpointDefinition, ResolvedNavigationItemApiSection } from "../../util/resolver";
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
        apiSection: ResolvedNavigationItemApiSection;
        onHoverRequestProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        onHoverResponseProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        selectedError: APIV1Read.ErrorDeclarationV2 | undefined;
        setSelectedError: (idx: APIV1Read.ErrorDeclarationV2 | undefined) => void;
        route: string;
        contentType: string | undefined;
        setContentType: (contentType: string) => void;
    }
}

const UnmemoizedEndpointContentLeft: React.FC<EndpointContentLeft.Props> = ({
    endpoint,
    apiSection,
    onHoverRequestProperty,
    onHoverResponseProperty,
    selectedError,
    setSelectedError,
    route,
    contentType,
    setContentType,
}) => {
    const requestExpandAll = useBooleanState(false);
    const responseExpandAll = useBooleanState(false);
    const errorExpandAll = useBooleanState(false);
    return (
        <div className="flex max-w-full flex-1 flex-col  gap-12">
            {endpoint.pathParameters.length > 0 && (
                <EndpointSection title="Path parameters" anchorIdParts={["request", "path"]} route={route}>
                    <div className="flex flex-col">
                        {endpoint.pathParameters.map((parameter) => (
                            <div className="flex flex-col" key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={["request", "path", parameter.key]}
                                    route={route}
                                    description={parameter.description}
                                    descriptionContainsMarkdown={parameter.descriptionContainsMarkdown ?? true}
                                    availability={parameter.availability}
                                />
                            </div>
                        ))}
                    </div>
                </EndpointSection>
            )}
            {endpoint.headers.length > 0 && (
                <EndpointSection title="Headers" anchorIdParts={["request", "header"]} route={route}>
                    <div className="flex flex-col">
                        {endpoint.headers.map((parameter) => (
                            <div className="flex flex-col" key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={["request", "header", parameter.key]}
                                    route={route}
                                    description={parameter.description}
                                    descriptionContainsMarkdown={parameter.descriptionContainsMarkdown ?? false}
                                    availability={parameter.availability}
                                />
                            </div>
                        ))}
                    </div>
                </EndpointSection>
            )}
            {endpoint.queryParameters.length > 0 && (
                <EndpointSection title="Query parameters" anchorIdParts={["request", "query"]} route={route}>
                    <div className="flex flex-col">
                        {endpoint.queryParameters.map((parameter) => (
                            <div className="flex flex-col" key={parameter.key}>
                                <TypeComponentSeparator />
                                <EndpointParameter
                                    name={parameter.key}
                                    shape={parameter.valueShape}
                                    anchorIdParts={["request", "query", parameter.key]}
                                    route={route}
                                    description={parameter.description}
                                    descriptionContainsMarkdown={parameter.descriptionContainsMarkdown ?? false}
                                    availability={parameter.availability}
                                />
                            </div>
                        ))}
                    </div>
                </EndpointSection>
            )}
            {endpoint.requestBody.length > 1 ? (
                <Tabs.Root asChild={true} value={contentType} onValueChange={setContentType}>
                    <FernCard className="-mx-4 rounded-xl shadow-sm">
                        <div className="bg-tag-default-soft rounded-t-[inherit]">
                            <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                                <Tabs.List className="flex min-h-10 overflow-x-auto px-4 font-mono">
                                    <div className="mr-2 flex items-center">
                                        <span className="t-muted text-xs font-semibold">Content-Type:</span>
                                    </div>
                                    {endpoint.requestBody.map((requestBody) => (
                                        <Tabs.Trigger
                                            key={requestBody.contentType}
                                            value={requestBody.contentType}
                                            className="data-[state=active]:shadow-accent-primary-light dark:data-[state=active]:shadow-accent-primary-dark group flex min-h-10 cursor-default items-center px-0 py-2 data-[state=active]:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]"
                                        >
                                            <span className="t-muted group-data-[state=active]:t-default group-hover:bg-tag-default rounded px-2 py-1 text-xs group-data-[state=active]:font-semibold">
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
                                        anchorIdParts={["request"]}
                                        route={route}
                                        expandAll={requestExpandAll.setTrue}
                                        collapseAll={requestExpandAll.setFalse}
                                        showExpandCollapse={true}
                                    >
                                        <EndpointRequestSection
                                            requestBody={requestBody}
                                            onHoverProperty={onHoverRequestProperty}
                                            anchorIdParts={["request", "body"]}
                                            route={route}
                                            defaultExpandAll={requestExpandAll.value}
                                        />
                                    </EndpointSection>
                                </Tabs.Content>
                            ))}
                        </div>
                    </FernCard>
                </Tabs.Root>
            ) : endpoint.requestBody[0] != null ? (
                <EndpointSection
                    key={endpoint.requestBody[0].contentType}
                    title="Request"
                    anchorIdParts={["request"]}
                    route={route}
                    expandAll={requestExpandAll.setTrue}
                    collapseAll={requestExpandAll.setFalse}
                    showExpandCollapse={true}
                >
                    <EndpointRequestSection
                        requestBody={endpoint.requestBody[0]}
                        onHoverProperty={onHoverRequestProperty}
                        anchorIdParts={["request", "body"]}
                        route={route}
                        defaultExpandAll={requestExpandAll.value}
                    />
                </EndpointSection>
            ) : null}
            {endpoint.responseBody != null && (
                <EndpointSection
                    title="Response"
                    anchorIdParts={["response"]}
                    route={route}
                    expandAll={responseExpandAll.setTrue}
                    collapseAll={responseExpandAll.setFalse}
                    showExpandCollapse={true}
                >
                    <EndpointResponseSection
                        responseBody={endpoint.responseBody}
                        onHoverProperty={onHoverResponseProperty}
                        anchorIdParts={["response", "body"]}
                        route={route}
                        defaultExpandAll={responseExpandAll.value}
                    />
                </EndpointSection>
            )}
            {apiSection.showErrors && endpoint.errors.length > 0 && (
                <EndpointSection
                    title="Errors"
                    anchorIdParts={["response", "error"]}
                    route={route}
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
                                    key={error.name ?? error.statusCode}
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
                                        "response",
                                        "error",
                                        `${convertNameToAnchorPart(error.name) ?? error.statusCode}`,
                                    ]}
                                    route={route}
                                    availability={error.availability}
                                    defaultExpandAll={errorExpandAll.value}
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

function isErrorEqual(a: APIV1Read.ErrorDeclarationV2, b: APIV1Read.ErrorDeclarationV2): boolean {
    return (
        a.statusCode === b.statusCode &&
        (a.name != null && b.name != null ? a.name === b.name : a.name == null && b.name == null)
    );
}

export function convertNameToAnchorPart(name: string | undefined): string | undefined {
    if (name == null) {
        return undefined;
    }
    return upperFirst(camelCase(name));
}
