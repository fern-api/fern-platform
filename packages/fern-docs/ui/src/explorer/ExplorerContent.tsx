import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ArrowLeft } from "iconoir-react";
import { ReactElement } from "react";
import { useExplorerNode } from "../atoms";
import { ExplorerEndpoint, ExplorerEndpointSkeleton } from "./endpoint";
import { useEndpointContext, useWebSocketContext } from "./hooks";
import { ExplorerWebSocket } from "./websocket";

const ExplorerContentForEndpoint = ({
  node,
}: {
  node: FernNavigation.EndpointNode;
}) => {
  const { context, isLoading } = useEndpointContext(node);

  if (context == null) {
    return isLoading ? <ExplorerEndpointSkeleton /> : null;
  }

  return <ExplorerEndpoint context={context} />;
};

const ExplorerContentForWebSocket = ({
  node,
}: {
  node: FernNavigation.WebSocketNode;
}) => {
  const { context, isLoading } = useWebSocketContext(node);

  if (context == null) {
    return isLoading ? <ExplorerEndpointSkeleton /> : null;
  }

  return <ExplorerWebSocket context={context} />;
};

export const ExplorerContent = (): ReactElement => {
  const node = useExplorerNode();
  if (node?.type === "endpoint") {
    return <ExplorerContentForEndpoint node={node} />;
  } else if (node?.type === "webSocket") {
    return <ExplorerContentForWebSocket node={node} />;
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <ArrowLeft className="t-muted mb-2 size-8" />
      <h6 className="t-muted">Select an endpoint to get started</h6>
    </div>
  );
};
