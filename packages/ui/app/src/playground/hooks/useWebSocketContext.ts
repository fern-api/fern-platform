import { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useAtomCallback } from "jotai/utils";
import { useMemo } from "react";
import { preload } from "swr";
import useSWRImmutable from "swr/immutable";
import { useCallbackOne } from "use-memo-one";
import { selectApiRoute, useApiRoute } from "../../hooks/useApiRoute";
import { WebSocketContext, createWebSocketContext } from "../types/endpoint-context";

interface LoadableWebSocketContext {
    context: WebSocketContext | undefined;
    isLoading: boolean;
}

/**
 * This hook leverages SWR to fetch and cache the definition for this endpoint.
 * It should be refactored to store the resulting endpoint in a global state, so that it can be shared between components.
 */
export function useWebSocketContext(node: FernNavigation.WebSocketNode): LoadableWebSocketContext {
    const route = useApiRoute(`/api/fern-docs/api-definition/${node.apiDefinitionId}/websocket/${node.webSocketId}`);
    const { data: apiDefinition, isLoading } = useSWRImmutable<ApiDefinition>(route, (url: string) =>
        fetch(url).then((res) => res.json()),
    );
    const context = useMemo(() => createWebSocketContext(node, apiDefinition), [node, apiDefinition]);

    return { context, isLoading };
}

export function usePreloadWebSocketContext(): (node: FernNavigation.WebSocketNode) => void {
    return useAtomCallback(
        useCallbackOne((get, _set, node: FernNavigation.WebSocketNode) => {
            const route = selectApiRoute(
                get,
                `/api/fern-docs/api-definition/${node.apiDefinitionId}/websocket/${node.webSocketId}`,
            );
            void preload(route, (url: string) => fetch(url).then((res) => res.json()));
        }, []),
    );
}
