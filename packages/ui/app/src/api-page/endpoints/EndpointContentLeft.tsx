import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { getEndpointTitleAsString, getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { noop } from "lodash-es";
import { memo } from "react";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointErrorsSection } from "./EndpointErrorsSection";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointRequestSection } from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

export interface HoveringProps {
    isHovering: boolean;
}

export declare namespace EndpointContentLeft {
    export interface Props {
        endpoint: APIV1Read.EndpointDefinition;
        package: APIV1Read.ApiDefinitionPackage;
        apiSection: DocsV1Read.ApiSection;
        onHoverRequestProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        onHoverResponseProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        errors: APIV1Read.ErrorDeclarationV2[];
        selectedErrorStatusCode: number | undefined;
        setSelectedErrorStatusCode: (idx: number | undefined) => void;
        route: string;
    }
}

const UnmemoizedEndpointContentLeft: React.FC<EndpointContentLeft.Props> = ({
    endpoint,
    package: package_,
    apiSection,
    onHoverRequestProperty,
    onHoverResponseProperty,
    errors,
    selectedErrorStatusCode,
    setSelectedErrorStatusCode,
    route,
}) => {
    const requestExpandAll = useBooleanState(false);
    const responseExpandAll = useBooleanState(false);
    const errorExpandAll = useBooleanState(false);
    return (
        <>
            <div className="space-y-2.5 pb-2 pt-8">
                {isSubpackage(package_) && (
                    <div className="text-accent-primary dark:text-accent-primary-dark text-xs font-semibold uppercase tracking-wider">
                        {getSubpackageTitle(package_)}
                    </div>
                )}
                <div>
                    <h2 className="mt-0 inline-block text-2xl sm:text-3xl">{getEndpointTitleAsString(endpoint)}</h2>
                    {endpoint.availability != null && (
                        <span className="relative">
                            <EndpointAvailabilityTag
                                className="absolute -top-1.5 left-2.5 inline-block"
                                availability={endpoint.availability}
                            />
                        </span>
                    )}
                </div>
            </div>
            <EndpointUrlWithOverflow endpoint={endpoint} />
            <ApiPageDescription className="mt-3" description={endpoint.description} isMarkdown={true} />
            <div className="mt-8 flex">
                <div className="flex max-w-full flex-1 flex-col  gap-12">
                    {endpoint.path.pathParameters.length > 0 && (
                        <PathParametersSection
                            pathParameters={endpoint.path.pathParameters}
                            anchorIdParts={["request", "path"]}
                            route={route}
                        />
                    )}
                    {endpoint.headers.length > 0 && (
                        <EndpointSection
                            title="Headers"
                            anchorIdParts={["request", "headers"]}
                            route={route}
                            showExpandCollapse={false}
                            expandAll={noop}
                            collapseAll={noop}
                        >
                            <div className="flex flex-col">
                                {endpoint.headers.map((header, index) => (
                                    <div className="flex flex-col" key={index}>
                                        <TypeComponentSeparator />
                                        <EndpointParameter
                                            name={header.key}
                                            type={header.type}
                                            anchorIdParts={["request", "headers", header.key]}
                                            route={route}
                                            description={header.description}
                                            descriptionContainsMarkdown={header.descriptionContainsMarkdown ?? false}
                                            availability={header.availability}
                                        />
                                    </div>
                                ))}
                            </div>
                        </EndpointSection>
                    )}
                    {endpoint.queryParameters.length > 0 && (
                        <QueryParametersSection
                            queryParameters={endpoint.queryParameters}
                            anchorIdParts={["request", "query"]}
                            route={route}
                        />
                    )}
                    {endpoint.request != null && (
                        <EndpointSection
                            title="Request"
                            anchorIdParts={["request", "body"]}
                            route={route}
                            expandAll={requestExpandAll.setTrue}
                            collapseAll={requestExpandAll.setFalse}
                            showExpandCollapse={true}
                        >
                            <EndpointRequestSection
                                httpRequest={endpoint.request}
                                onHoverProperty={onHoverRequestProperty}
                                anchorIdParts={["request", "body"]}
                                route={route}
                                defaultExpandAll={requestExpandAll.value}
                            />
                        </EndpointSection>
                    )}
                    {endpoint.response != null && (
                        <EndpointSection
                            title="Response"
                            anchorIdParts={["response", "body"]}
                            route={route}
                            expandAll={responseExpandAll.setTrue}
                            collapseAll={responseExpandAll.setFalse}
                            showExpandCollapse={true}
                        >
                            <EndpointResponseSection
                                httpResponse={endpoint.response}
                                onHoverProperty={onHoverResponseProperty}
                                anchorIdParts={["response", "body"]}
                                route={route}
                                defaultExpandAll={responseExpandAll.value}
                            />
                        </EndpointSection>
                    )}
                    {apiSection.showErrors && errors.length > 0 && (
                        <EndpointSection
                            title="Errors"
                            anchorIdParts={["response", "errors"]}
                            route={route}
                            expandAll={errorExpandAll.setTrue}
                            collapseAll={errorExpandAll.setFalse}
                            showExpandCollapse={false}
                        >
                            <EndpointErrorsSection
                                errors={errors}
                                onClickError={(error, _, event) => {
                                    event.stopPropagation();
                                    setSelectedErrorStatusCode(error.statusCode);
                                }}
                                onHoverProperty={onHoverResponseProperty}
                                selectedErrorStatusCode={selectedErrorStatusCode}
                                anchorIdParts={["response", "errors"]}
                                route={route}
                                defaultExpandAll={errorExpandAll.value}
                            />
                        </EndpointSection>
                    )}
                </div>
            </div>
        </>
    );
};

export const EndpointContentLeft = memo(UnmemoizedEndpointContentLeft);
