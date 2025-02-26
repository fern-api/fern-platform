import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import { useAtomValue } from "jotai";
import { memo, type ReactNode } from "react";
import { IS_PLAYGROUND_ENABLED_ATOM } from "../../atoms";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { usePlaygroundSettings } from "../../hooks/usePlaygroundSettings";
import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { usePlaygroundBaseUrl } from "../../playground/utils/select-environment";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

interface EndpointContentHeaderProps {
  context: EndpointContext;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  streamToggle?: ReactNode;
}

export const EndpointContentHeader = memo<EndpointContentHeaderProps>(
  ({ context, breadcrumb, streamToggle }) => {
    const { endpoint, node } = context;
    const [baseUrl, environmentId] = usePlaygroundBaseUrl(endpoint);
    const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
    const settings = usePlaygroundSettings(node.id ?? node);
    const usePlayground =
      node != null && isPlaygroundEnabled && !settings?.disabled;
    const playgroundButton = usePlayground ? (
      <PlaygroundButton state={node} className="md:hidden" />
    ) : undefined;
    return (
      <header className="space-y-1 pb-2 pt-8">
        <FernBreadcrumbs breadcrumb={breadcrumb} />
        <div className="flex items-center justify-between">
          <span>
            <h1 className="fern-page-heading">{node.title}</h1>
            {endpoint.availability != null && (
              <span className="ml-2 inline-block align-text-bottom">
                <AvailabilityBadge
                  availability={endpoint.availability}
                  rounded
                />
              </span>
            )}
          </span>

          {streamToggle}
        </div>

        <div className="flex items-center justify-between">
          <EndpointUrlWithOverflow
            baseUrl={baseUrl}
            environmentId={environmentId}
            path={endpoint.path}
            method={endpoint.method}
            options={endpoint.environments}
            showEnvironment
            large
          />
          {playgroundButton}
        </div>
      </header>
    );
  }
);

EndpointContentHeader.displayName = "EndpointContentHeader";
