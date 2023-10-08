import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { ApiSection } from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { getEndpointTitleAsString, getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import { memo } from "react";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointErrorsSection } from "./EndpointErrorsSection";
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
        endpoint: FernRegistryApiRead.EndpointDefinition;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        anchorIdParts: string[];
        apiSection: ApiSection;
        onHoverRequestProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        onHoverResponseProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        errors: FernRegistryApiRead.ErrorDeclarationV2[];
        selectedErrorIndex: number | null;
        setSelectedErrorIndex: (idx: number | null) => void;
    }
}

const UnmemoizedEndpointContentLeft: React.FC<EndpointContentLeft.Props> = ({
    endpoint,
    package: package_,
    anchorIdParts,
    apiSection,
    onHoverRequestProperty,
    onHoverResponseProperty,
    errors,
    selectedErrorIndex,
    setSelectedErrorIndex,
}) => {
    return (
        <>
            <div className="pb-2 pt-8">
                {isSubpackage(package_) && (
                    <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                        {getSubpackageTitle(package_)}
                    </div>
                )}
                <div>
                    <span className="typography-font-heading text-text-primary-light dark:text-text-primary-dark text-3xl font-bold">
                        {getEndpointTitleAsString(endpoint)}
                    </span>
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
                <div className="flex flex-1 flex-col gap-12">
                    {endpoint.path.pathParameters.length > 0 && (
                        <PathParametersSection
                            pathParameters={endpoint.path.pathParameters}
                            anchorIdParts={[...anchorIdParts, "path"]}
                        />
                    )}
                    {endpoint.queryParameters.length > 0 && (
                        <QueryParametersSection
                            queryParameters={endpoint.queryParameters}
                            anchorIdParts={[...anchorIdParts, "query"]}
                        />
                    )}
                    {endpoint.request != null && (
                        <EndpointSection title="Request" anchorIdParts={[...anchorIdParts, "request"]}>
                            <EndpointRequestSection
                                httpRequest={endpoint.request}
                                onHoverProperty={onHoverRequestProperty}
                                anchorIdParts={[...anchorIdParts, "request"]}
                            />
                        </EndpointSection>
                    )}
                    {endpoint.response != null && (
                        <EndpointSection title="Response" anchorIdParts={[...anchorIdParts, "response"]}>
                            <EndpointResponseSection
                                httpResponse={endpoint.response}
                                onHoverProperty={onHoverResponseProperty}
                                anchorIdParts={[...anchorIdParts, "response"]}
                            />
                        </EndpointSection>
                    )}
                    {apiSection.showErrors && errors.length > 0 && (
                        <EndpointSection title="Errors" anchorIdParts={[...anchorIdParts, "response"]}>
                            <EndpointErrorsSection
                                errors={errors}
                                onClickError={(_, idx, event) => {
                                    event.stopPropagation();
                                    setSelectedErrorIndex(idx);
                                }}
                                selectError={(_, idx) => setSelectedErrorIndex(idx)}
                                onHoverProperty={onHoverResponseProperty}
                                selectedErrorIndex={selectedErrorIndex}
                                anchorIdParts={[...anchorIdParts, "errors"]}
                            />
                        </EndpointSection>
                    )}
                </div>
            </div>
        </>
    );
};

export const EndpointContentLeft = memo(UnmemoizedEndpointContentLeft);
