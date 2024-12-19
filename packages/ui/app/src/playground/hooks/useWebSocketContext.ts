import type { ApiDefinition, WebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import { createWebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { WRITE_API_DEFINITION_ATOM, useApiRouteSWRImmutable } from "../../atoms";

interface LoadableWebSocketContext {
    context: WebSocketContext | undefined;
    isLoading: boolean;
}

/**
 * This hook leverages SWR to fetch and cache the definition for this endpoint.
 * It should be refactored to store the resulting endpoint in a global state, so that it can be shared between components.
 */
export function useWebSocketContext(node: FernNavigation.WebSocketNode): LoadableWebSocketContext {
    const { data: apiDefinition, isLoading } = useApiRouteSWRImmutable<ApiDefinition>(
        `/api/fern-docs/api-definition/${encodeURIComponent(node.apiDefinitionId)}/websocket/${encodeURIComponent(node.webSocketId)}`,
        { disabled: node == null },
    );
    const context = useMemo(() => createWebSocketContext(node, apiDefinition), [node, apiDefinition]);

    const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
    useEffect(() => {
        if (apiDefinition != null) {
            set(apiDefinition);
        }
    }, [apiDefinition, set]);

    return { context, isLoading };
}
