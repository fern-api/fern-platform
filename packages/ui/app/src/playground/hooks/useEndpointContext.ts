import { createEndpointContext, type ApiDefinition, type EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useSetAtom } from "jotai";
import { useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { WRITE_API_DEFINITION_ATOM } from "../../atoms";
import { useApiRoute } from "../../hooks/useApiRoute";

interface LoadableEndpointContext {
    context: EndpointContext | undefined;
    isLoading: boolean;
}

const fetcher = (url: string): Promise<ApiDefinition> => fetch(url).then((res) => res.json());

/**
 * This hook leverages SWR to fetch and cache the definition for this endpoint.
 * It should be refactored to store the resulting endpoint in a global state, so that it can be shared between components.
 */
export function useEndpointContext(node: FernNavigation.EndpointNode | undefined): LoadableEndpointContext {
    const route = useApiRoute(
        `/api/fern-docs/api-definition/${encodeURIComponent(node?.apiDefinitionId ?? "")}/endpoint/${encodeURIComponent(node?.endpointId ?? "")}`,
    );
    const { data: apiDefinition, isLoading } = useSWRImmutable(node != null ? route : null, fetcher);
    const context = useMemo(() => createEndpointContext(node, apiDefinition), [node, apiDefinition]);
    const set = useSetAtom(WRITE_API_DEFINITION_ATOM);

    if (apiDefinition != null) {
        set(apiDefinition);
    }

    return { context, isLoading };
}
