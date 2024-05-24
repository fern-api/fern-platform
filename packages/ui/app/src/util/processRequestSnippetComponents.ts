import { parse } from "url";
import urljoin from "url-join";
import { ResolvedEndpointDefinition, ResolvedEndpointPathParts, ResolvedWithApiDefinition } from "../resolver/types";

export function findEndpoint({
    api,
    method,
    path,
}: {
    api: ResolvedWithApiDefinition;
    method: string;
    path: string;
}): ResolvedEndpointDefinition | undefined {
    path = path.startsWith("/") ? path : `/${path}`;
    for (const item of api.items) {
        if (item.type !== "endpoint") {
            continue;
        }
        if (item.method === method && getMatchablePermutationsForEndpoint(item).has(path)) {
            return item;
        }
    }

    for (const [_, subpackage] of Object.entries(api.items)) {
        if (subpackage.type === "subpackage") {
            const endpoint = findEndpoint({ api: subpackage, method, path });
            if (endpoint) {
                return endpoint;
            }
        }
    }

    return undefined;
}

export function getMatchablePermutationsForEndpoint(
    endpoint: Pick<ResolvedEndpointDefinition, "path" | "environments">,
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

function getPathFromEndpoint1(path: ResolvedEndpointPathParts[]): string {
    return urljoin("/", ...path.map((part) => (part.type === "literal" ? part.value : `{${part.key}}`)));
}

function getPathFromEndpoint2(path: ResolvedEndpointPathParts[]): string {
    return urljoin("/", ...path.map((part) => (part.type === "literal" ? part.value : `:${part.key}`)));
}
