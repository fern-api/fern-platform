import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ArrowLeft } from "iconoir-react";
import { ReactElement } from "react";
import { usePlaygroundNode } from "../atoms";
import { PlaygroundEndpoint, PlaygroundEndpointSkeleton } from "./endpoint";
import { useEndpointContext, useWebSocketContext } from "./hooks";
import { PlaygroundWebSocket } from "./websocket";

const PlaygroundContentForEndpoint = ({
  node,
}: {
  node: FernNavigation.EndpointNode;
}) => {
  const { context, isLoading } = useEndpointContext(node);

  if (context == null) {
    return isLoading ? <PlaygroundEndpointSkeleton /> : null;
  }

  return <PlaygroundEndpoint context={context} />;
};

const PlaygroundContentForWebSocket = ({
  node,
}: {
  node: FernNavigation.WebSocketNode;
}) => {
  const { context, isLoading } = useWebSocketContext(node);

  if (context == null) {
    return isLoading ? <PlaygroundEndpointSkeleton /> : null;
  }

  return <PlaygroundWebSocket context={context} />;
};

export const PlaygroundContent = (): ReactElement => {
  const node = usePlaygroundNode();
  if (node?.type === "endpoint") {
    return <PlaygroundContentForEndpoint node={node} />;
  } else if (node?.type === "webSocket") {
    return <PlaygroundContentForWebSocket node={node} />;
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <ArrowLeft className="t-muted mb-2 size-8" />
      <h6 className="t-muted">Select an endpoint to get started</h6>
    </div>
  );
};
