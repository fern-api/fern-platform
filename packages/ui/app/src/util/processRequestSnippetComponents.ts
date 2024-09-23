import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { parse } from "url";
import urljoin from "url-join";

export function findEndpoint({
    api,
    method,
    path,
}: {
    api: ApiDefinition.ApiDefinition;
    method: string;
    path: string;
}): ApiDefinition.EndpointDefinition | undefined {
    path = path.startsWith("/") ? path : `/${path}`;
    for (const item of Object.values(api.endpoints)) {
        if (item.method === method && getMatchablePermutationsForEndpoint(item).has(path)) {
            return item;
        }
    }

    return undefined;
}

export function getMatchablePermutationsForEndpoint(
    endpoint: Pick<ApiDefinition.EndpointDefinition, "path" | "environments">,
): Set<string> {
    const path1 = getPathFromEndpoint1(endpoint.path);
    const path2 = getPathFromEndpoint2(endpoint.path);
    const possiblePaths = new Set([path1, path2]);
    endpoint.environments.forEach((env) => {
        const fullUrl1 = urljoin(env.baseUrl, path1);
        const fullUrl2 = urljoin(env.baseUrl, path2);
        possiblePaths.add(fullUrl1);
        possiblePaths.add(fullUrl2);

        const basePath = parse(env.baseUrl).path;
        if (basePath != null) {
            const urlWithBasePath1 = urljoin(basePath, path1);
            const urlWithBasePath2 = urljoin(basePath, path2);
            possiblePaths.add(urlWithBasePath1);
            possiblePaths.add(urlWithBasePath2);
        }
    });
    return possiblePaths;
}

function getPathFromEndpoint1(path: ApiDefinition.EndpointPathPart[]): string {
    return urljoin("/", ...path.map((part) => (part.type === "literal" ? part.value : `{${part.value}}`)));
}

function getPathFromEndpoint2(path: ApiDefinition.EndpointPathPart[]): string {
    return urljoin("/", ...path.map((part) => (part.type === "literal" ? part.value : `:${part.value}`)));
}
