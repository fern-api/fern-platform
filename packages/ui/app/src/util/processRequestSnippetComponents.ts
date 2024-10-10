import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { parse } from "url";
import urljoin from "url-join";

export function findEndpoint({
    apiDefinition,
    method,
    path,
}: {
    apiDefinition: ApiDefinition.ApiDefinition;
    method: string;
    path: string;
}): ApiDefinition.EndpointDefinition | undefined {
    path = path.startsWith("/") ? path : `/${path}`;
    for (const endpoint of Object.values(apiDefinition.endpoints)) {
        if (endpoint.method === method && getMatchablePermutationsForEndpoint(endpoint).has(path)) {
            return endpoint;
        }
    }

    return undefined;
}

export function getMatchablePermutationsForEndpoint(
    endpoint: Pick<ApiDefinition.EndpointDefinition, "path" | "environments">,
): Set<string> {
    const path1 = ApiDefinition.toCurlyBraceEndpointPathLiteral(endpoint.path);
    const path2 = ApiDefinition.toColonEndpointPathLiteral(endpoint.path);
    const possiblePaths = new Set<string>([path1, path2]);
    endpoint.environments?.forEach((env) => {
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
