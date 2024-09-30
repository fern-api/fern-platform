import { unknownToString } from "@fern-ui/core-utils";
import { ResolvedEndpointDefinition, ResolvedEndpointPathParts, resolveEnvironment } from "../../resolver/types";
import { PlaygroundRequestFormState } from "../types";

export function buildQueryParams(queryParameters: Record<string, unknown> | undefined): string {
    if (queryParameters == null) {
        return "";
    }
    const queryParams = new URLSearchParams();
    Object.entries(queryParameters).forEach(([key, value]) => {
        if (value != null) {
            queryParams.set(key, unknownToString(value));
        }
    });
    return queryParams.size > 0 ? "?" + queryParams.toString() : "";
}

function buildPath(path: ResolvedEndpointPathParts[], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const stateValue = unknownToString(pathParameters?.[part.key]);
                return stateValue.length > 0 ? encodeURIComponent(stateValue) : ":" + part.key;
            }
            return part.value;
        })
        .join("");
}

export function buildRequestUrl(
    baseUrl: string = "",
    path: ResolvedEndpointPathParts[] = [],
    pathParameters: Record<string, unknown> = {},
    queryParameters: Record<string, unknown> = {},
): string {
    return baseUrl + buildPath(path, pathParameters) + buildQueryParams(queryParameters);
}

export function buildEndpointUrl(
    endpoint: ResolvedEndpointDefinition | undefined,
    formState: PlaygroundRequestFormState | undefined,
    playgroundEnvironment: string | undefined,
): string {
    return buildRequestUrl(
        playgroundEnvironment ?? (endpoint && resolveEnvironment(endpoint)?.baseUrl),
        endpoint?.path,
        formState?.pathParameters,
        formState?.queryParameters,
    );
}
