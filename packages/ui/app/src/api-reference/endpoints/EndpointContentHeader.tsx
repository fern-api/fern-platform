import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { memo, type ReactNode } from "react";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { EndpointContext } from "../../playground/types/endpoint-context";
import { useSelectedEnvironment } from "../../playground/utils/select-environment";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

interface EndpointContentHeaderProps {
    context: EndpointContext;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    streamToggle?: ReactNode;
}

export const EndpointContentHeader = memo<EndpointContentHeaderProps>(({ context, breadcrumb, streamToggle }) => {
    const { endpoint, node } = context;
    const selectedEnvironment = useSelectedEnvironment(endpoint);
    return (
        <header className="space-y-1 pb-2 pt-8">
            <FernBreadcrumbs breadcrumb={breadcrumb} />
            <div className="flex items-center justify-between">
                <span>
                    <h1 className="fern-page-heading">{node.title}</h1>
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
                selectedEnvironment={selectedEnvironment}
                showEnvironment
                large
            />
        </header>
    );
});

EndpointContentHeader.displayName = "EndpointContentHeader";
