import { unknownToString } from "@fern-ui/core-utils";
import { ResolvedEndpointPathParts } from "./types";

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
function buildPath(path: ResolvedEndpointPathParts[], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const key = part.key;
                const stateValue = unknownToString(pathParameters?.[key]);
                return stateValue.length > 0 ? encodeURIComponent(stateValue) : ":" + key;
            }
            return part.value;
        })
        .join("");
}

/**
 * @deprecated
 */
export function buildRequestUrl(
    baseUrl: string = "",
    path: ResolvedEndpointPathParts[] = [],
    pathParameters: Record<string, unknown> = {},
    queryParameters: Record<string, unknown> = {},
): string {
    return baseUrl + buildPath(path, pathParameters) + buildQueryParams(queryParameters);
}
