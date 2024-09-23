import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { memo, type ReactNode } from "react";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

interface EndpointContentHeaderProps {
    endpoint: ApiDefinition.EndpointDefinition;
    streamToggle?: ReactNode;
}

export const EndpointContentHeader = memo<EndpointContentHeaderProps>(({ endpoint, streamToggle }) => {
    const selectedEnvironmentId = useSelectedEnvironmentId();
    return (
        <header className="space-y-1 pb-2 pt-8">
            <FernBreadcrumbs breadcrumbs={endpoint.breadcrumbs} />
            <div className="flex items-center justify-between">
                <span>
                    <h1 className="fern-page-heading">{endpoint.title}</h1>
                    {endpoint.availability != null && (
                        <span className="inline-block ml-2 align-text-bottom">
                            <EndpointAvailabilityTag availability={endpoint.availability} minimal={true} />
                        </span>
                    )}
                </span>

                {streamToggle}
            </div>
            <EndpointUrlWithOverflow
                path={endpoint.path}
                method={endpoint.method}
                selectedEnvironment={resolveEnvironment(endpoint, selectedEnvironmentId)}
                showEnvironment
                large
            />
        </header>
    );
});

EndpointContentHeader.displayName = "EndpointContentHeader";
