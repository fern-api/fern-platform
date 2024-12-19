import {
    createEndpointContext,
    type ApiDefinition,
    type EndpointContext,
} from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useMemo } from "react";
import { useWriteApiDefinitionAtom } from "../../atoms";
import { useApiRouteSWRImmutable } from "../../hooks/useApiRouteSWR";

interface LoadableEndpointContext {
    context: EndpointContext | undefined;
    isLoading: boolean;
}

/**
 * This hook leverages SWR to fetch and cache the definition for this endpoint.
 * It should be refactored to store the resulting endpoint in a global state, so that it can be shared between components.
 */
export function useEndpointContext(
    node: FernNavigation.EndpointNode | undefined
): LoadableEndpointContext {
    const { data: apiDefinition, isLoading } =
        useApiRouteSWRImmutable<ApiDefinition>(
            `/api/fern-docs/api-definition/${encodeURIComponent(node?.apiDefinitionId ?? "")}/endpoint/${encodeURIComponent(node?.endpointId ?? "")}`,
            { disabled: node == null }
        );
    const context = useMemo(
        () => createEndpointContext(node, apiDefinition),
        [node, apiDefinition]
    );
    useWriteApiDefinitionAtom(apiDefinition);

    return { context, isLoading };
}
