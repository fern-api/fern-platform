import { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useSetAtom } from "jotai";
import { useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { WRITE_API_DEFINITION_ATOM } from "../../atoms";
import { useApiRoute } from "../../hooks/useApiRoute";
import { WebSocketContext, createWebSocketContext } from "../types/endpoint-context";

interface LoadableWebSocketContext {
    context: WebSocketContext | undefined;
    isLoading: boolean;
}

const fetcher = (url: string): Promise<ApiDefinition> => fetch(url).then((res) => res.json());

/**
 * This hook leverages SWR to fetch and cache the definition for this endpoint.
 * It should be refactored to store the resulting endpoint in a global state, so that it can be shared between components.
 */
export function useWebSocketContext(node: FernNavigation.WebSocketNode): LoadableWebSocketContext {
    const route = useApiRoute(
        `/api/fern-docs/api-definition/${encodeURIComponent(node.apiDefinitionId)}/websocket/${encodeURIComponent(node.webSocketId)}`,
    );
    const { data: apiDefinition, isLoading } = useSWRImmutable(route, fetcher);
    const context = useMemo(() => createWebSocketContext(node, apiDefinition), [node, apiDefinition]);

    const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
    if (apiDefinition != null) {
        set(apiDefinition);
    }

    return { context, isLoading };
}
