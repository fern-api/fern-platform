import {
    EndpointDefinition,
    Environment,
    EnvironmentId,
    WebSocketChannel,
} from "@fern-api/fdr-sdk/api-definition";
import { useAtomValue } from "jotai";
import { usePlaygroundEnvironment } from "../../atoms";
import { SELECTED_ENVIRONMENT_ATOM } from "../../atoms/environment";

function selectEnvironment(
    endpoint: WebSocketChannel | EndpointDefinition,
    selectedEnvironmentId?: string
): Environment | undefined {
    return (
        endpoint.environments?.find(
            (environment) => environment.id === selectedEnvironmentId
        ) ??
        endpoint.environments?.find(
            (environment) => environment.id === endpoint.defaultEnvironment
        ) ??
        endpoint.environments?.[0]
    );
}

export function useSelectedEnvironment(
    endpoint: WebSocketChannel | EndpointDefinition
): Environment | undefined {
    const selectedEnvironmentId = useAtomValue(SELECTED_ENVIRONMENT_ATOM);
    return selectEnvironment(endpoint, selectedEnvironmentId);
}

export function usePlaygroundBaseUrl(
    endpoint: WebSocketChannel | EndpointDefinition
): [baseUrl: string | undefined, environmentId: EnvironmentId | undefined] {
    const environment = useSelectedEnvironment(endpoint);
    const playgroundBaseUrl = usePlaygroundEnvironment();
    return [playgroundBaseUrl ?? environment?.baseUrl, environment?.id];
}
