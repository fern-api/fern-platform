import { APIV1Read } from "@fern-api/fdr-sdk";
import { useBooleanState } from "@fern-ui/react-commons";
import { camelCase, sortBy, upperFirst } from "lodash-es";
import { memo } from "react";
import { ResolvedEndpointDefinition, ResolvedNavigationItemApiSection } from "../../util/resolver";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
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
            {endpoint.requestBody != null && (
                <EndpointSection
                    title="Request"
                    anchorIdParts={["request"]}
                    route={route}
                    expandAll={requestExpandAll.setTrue}
                    collapseAll={requestExpandAll.setFalse}
                    showExpandCollapse={true}
                >
                    <EndpointRequestSection
                        requestBody={endpoint.requestBody}
                        onHoverProperty={onHoverRequestProperty}
                        anchorIdParts={["request", "body"]}
                        route={route}
                        defaultExpandAll={requestExpandAll.value}
                    />
                </EndpointSection>
            )}
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
                    <div className="border-default flex flex-col overflow-visible rounded-md border">
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
