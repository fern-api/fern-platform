import {
  createEndpointContext,
  type ApiDefinition,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { memo, useMemo } from "react";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
  export interface Props {
    showErrors: boolean;
    node: FernNavigation.EndpointNode;
    apiDefinition: ApiDefinition;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    streamToggle?: React.ReactElement;
    last?: boolean;
  }
}

const UnmemoizedEndpoint: React.FC<Endpoint.Props> = ({
  showErrors,
  node,
  apiDefinition,
  breadcrumb,
  streamToggle,
  last,
}) => {
  const context = useMemo(
    () => createEndpointContext(node, apiDefinition),
    [node, apiDefinition]
  );

  if (!context) {
    // eslint-disable-next-line no-console
    console.error("Could not create context for endpoint", node);
    return null;
  }

  return (
    <EndpointContent
      breadcrumb={breadcrumb}
      showErrors={showErrors}
      context={context}
      streamToggle={streamToggle}
      last={last}
    />
  );
};

export const Endpoint = memo(UnmemoizedEndpoint);
