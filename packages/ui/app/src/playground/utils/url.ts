import { EndpointDefinition, PathPart } from "@fern-api/fdr-sdk/api-definition";
import { unknownToString } from "@fern-ui/core-utils";
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

function buildPath(path: PathPart[], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const key = part.value;
                const stateValue = unknownToString(pathParameters?.[key]);
                return stateValue.length > 0 ? encodeURIComponent(stateValue) : ":" + key;
            }
            return part.value;
        })
        .join("");
}

export function buildRequestUrl(
    baseUrl: string = "",
    path: PathPart[] = [],
    pathParameters: Record<string, unknown> = {},
    queryParameters: Record<string, unknown> = {},
): string {
    return baseUrl + buildPath(path, pathParameters) + buildQueryParams(queryParameters);
}

export function buildEndpointUrl(
    endpoint: EndpointDefinition | undefined,
    formState: PlaygroundRequestFormState | undefined,
    playgroundEnvironment: string | undefined,
): string {
    return buildRequestUrl(
        playgroundEnvironment ??
            (
                endpoint?.environments?.find((env) => env.id === endpoint.defaultEnvironment) ??
                endpoint?.environments?.[0]
            )?.baseUrl,
        endpoint?.path,
        formState?.pathParameters,
        formState?.queryParameters,
    );
}
