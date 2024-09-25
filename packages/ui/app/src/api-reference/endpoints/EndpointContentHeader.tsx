import { memo, type ReactNode } from "react";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { ResolvedEndpointDefinition, resolveEnvironment } from "../../resolver/types";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

interface EndpointContentHeaderProps {
    endpoint: ResolvedEndpointDefinition;
    streamToggle?: ReactNode;
}

export const EndpointContentHeader = memo<EndpointContentHeaderProps>(({ endpoint, streamToggle }) => {
    const selectedEnvironmentId = useSelectedEnvironmentId();
    return (
        <header className="space-y-1 pb-2 pt-8">
            <FernBreadcrumbs breadcrumb={endpoint.breadcrumb} />
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
