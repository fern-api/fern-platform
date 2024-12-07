import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-ui/components/badges";
import { memo, type ReactNode } from "react";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { usePlaygroundBaseUrl } from "../../playground/utils/select-environment";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

interface EndpointContentHeaderProps {
    context: EndpointContext;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    streamToggle?: ReactNode;
}

export const EndpointContentHeader = memo<EndpointContentHeaderProps>(({ context, breadcrumb, streamToggle }) => {
    const { endpoint, node } = context;
    const [baseUrl, environmentId] = usePlaygroundBaseUrl(endpoint);
    return (
        <header className="space-y-1 pb-2 pt-8">
            <FernBreadcrumbs breadcrumb={breadcrumb} />
            <div className="flex items-center justify-between">
                <span>
                    <h1 className="fern-page-heading">{node.title}</h1>
                    {endpoint.availability != null && (
                        <span className="inline-block ml-2 align-text-bottom">
                            <AvailabilityBadge availability={endpoint.availability} rounded />
                        </span>
                    )}
                </span>

                {streamToggle}
            </div>
            <EndpointUrlWithOverflow
                baseUrl={baseUrl}
                environmentId={environmentId}
                path={endpoint.path}
                method={endpoint.method}
                options={endpoint.environments}
                showEnvironment
                large
            />
        </header>
    );
});

EndpointContentHeader.displayName = "EndpointContentHeader";
