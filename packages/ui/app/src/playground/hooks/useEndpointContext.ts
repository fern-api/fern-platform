import { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useAtomCallback } from "jotai/utils";
import { useMemo } from "react";
import { preload } from "swr";
import useSWRImmutable from "swr/immutable";
import { useCallbackOne } from "use-memo-one";
import { selectApiRoute, useApiRoute } from "../../hooks/useApiRoute";
import { EndpointContext, createEndpointContext } from "../types/endpoint-context";

interface LoadableEndpointContext {
    context: EndpointContext | undefined;
    isLoading: boolean;
}

/**
 * This hook leverages SWR to fetch and cache the definition for this endpoint.
 * It should be refactored to store the resulting endpoint in a global state, so that it can be shared between components.
 */
export function useEndpointContext(node: FernNavigation.EndpointNode | undefined): LoadableEndpointContext {
    const route = useApiRoute(`/api/fern-docs/api-definition/${node?.apiDefinitionId}/endpoint/${node?.endpointId}`);
    const { data: apiDefinition, isLoading } = useSWRImmutable<ApiDefinition | undefined>(route, (url: string) => {
        if (node == null) {
            return undefined;
        }
        return fetch(url).then((res) => res.json());
    });
    const context = useMemo(() => createEndpointContext(node, apiDefinition), [node, apiDefinition]);

    return { context, isLoading };
}

export function usePreloadEndpointContext(): (node: FernNavigation.EndpointNode) => void {
    return useAtomCallback(
        useCallbackOne((get, _set, node: FernNavigation.EndpointNode) => {
            const route = selectApiRoute(
                get,
                `/api/fern-docs/api-definition/${node.apiDefinitionId}/endpoint/${node.endpointId}`,
            );
            void preload(route, (url: string) => fetch(url).then((res) => res.json()));
        }, []),
    );
}
