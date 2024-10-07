import { EndpointDefinition, PathPart } from "@fern-api/fdr-sdk/api-definition";
import { unknownToString } from "@fern-ui/core-utils";

function buildQueryParams(queryParameters: Record<string, unknown> | undefined): string {
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

function buildPath(path: PathPart[] = [], pathParameters?: Record<string, unknown>): string {
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

interface BuildRequestUrlOptions {
    path?: PathPart[];
    pathParameters?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    baseUrl?: string;
}
export function buildRequestUrl({
    baseUrl = "",
    path,
    pathParameters,
    queryParameters,
}: BuildRequestUrlOptions): string {
    return baseUrl + buildPath(path, pathParameters) + buildQueryParams(queryParameters);
}

interface BuildEndpointUrlOptions {
    endpoint?: EndpointDefinition;
    pathParameters?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    baseUrl?: string;
}
export function buildEndpointUrl({
    endpoint,
    pathParameters,
    queryParameters,
    baseUrl,
}: BuildEndpointUrlOptions): string {
    return buildRequestUrl({
        baseUrl:
            baseUrl ??
            (
                endpoint?.environments?.find((env) => env.id === endpoint.defaultEnvironment) ??
                endpoint?.environments?.[0]
            )?.baseUrl,
        path: endpoint?.path,
        pathParameters,
        queryParameters,
    });
}
