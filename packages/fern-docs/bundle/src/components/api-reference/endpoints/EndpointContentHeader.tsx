import { PageHeader } from "@/components/components/PageHeader";
import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import { memo, type ReactNode } from "react";
import { EndpointUrlWithPlaygroundBaseUrl } from "./EndpointUrlWithPlaygroundBaseUrl";

interface EndpointContentHeaderProps {
  context: EndpointContext;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  streamToggle?: ReactNode;
}

export const EndpointContentHeader = memo<EndpointContentHeaderProps>(
  ({ context, breadcrumb }) => {
    const { endpoint, node } = context;
    return (
      <PageHeader
        breadcrumb={breadcrumb}
        title={node.title}
        tags={
          endpoint.availability != null && (
            <AvailabilityBadge availability={endpoint.availability} rounded />
          )
        }
      >
        <EndpointUrlWithPlaygroundBaseUrl endpoint={endpoint} />
      </PageHeader>
    );
  }
);

EndpointContentHeader.displayName = "EndpointContentHeader";
