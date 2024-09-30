import { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_OBJECT } from "@fern-ui/core-utils";
import { ArrowLeft } from "iconoir-react";
import { ReactElement, useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { usePlaygroundNode } from "../atoms";
import { useApiRoute } from "../hooks/useApiRoute";
import { PlaygroundWebSocket } from "./PlaygroundWebSocket";
import { PlaygroundEndpoint } from "./endpoint/PlaygroundEndpoint";
import { PlaygroundEndpointSkeleton } from "./endpoint/PlaygroundEndpointSkeleton";
import { createEndpointContext } from "./types/endpoint-context";

const PlaygroundContentForEndpoint = ({ node }: { node: FernNavigation.EndpointNode }) => {
    const route = useApiRoute(`/api/fern-docs/api-definition/${node.apiDefinitionId}/endpoint/${node.endpointId}`);
    const { data: apiDefinition, isLoading } = useSWRImmutable<ApiDefinition>(route, (url: string) =>
        fetch(url).then((res) => res.json()),
    );
    const ctx = useMemo(() => createEndpointContext(node, apiDefinition), [node, apiDefinition]);

    if (ctx == null && isLoading) {
        return <PlaygroundEndpointSkeleton />;
    }

    if (ctx == null) {
        return null;
    }

    return <PlaygroundEndpoint context={ctx} />;
};

const PlaygroundContentForWebSocket = ({ node }: { node: FernNavigation.WebSocketNode }) => {
    const route = useApiRoute(`/api/fern-docs/api-definition/${node.apiDefinitionId}/websocket/${node.webSocketId}`);
    const { data: apiDefinition, isLoading } = useSWRImmutable<ApiDefinition>(route, (url: string) =>
        fetch(url).then((res) => res.json()),
    );
    const websocket = apiDefinition?.websockets[node.webSocketId];
    if (websocket == null && isLoading) {
        return <PlaygroundEndpointSkeleton />;
    }

    if (websocket == null) {
        return null;
    }

    return <PlaygroundWebSocket websocket={websocket} types={apiDefinition?.types ?? EMPTY_OBJECT} />;
};

export const PlaygroundContent = (): ReactElement => {
    const node = usePlaygroundNode();
    if (node?.type === "endpoint") {
        return <PlaygroundContentForEndpoint node={node} />;
    } else if (node?.type === "webSocket") {
        return <PlaygroundContentForWebSocket node={node} />;
    }

    return (
        <div className="size-full flex flex-col items-center justify-center">
            <ArrowLeft className="size-8 mb-2 t-muted" />
            <h6 className="t-muted">Select an endpoint to get started</h6>
        </div>
    );
};
