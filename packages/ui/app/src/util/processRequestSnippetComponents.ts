import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { parse } from "url";
import urljoin from "url-join";

export function findEndpoint({
    apiDefinition,
    method,
    path,
    example: exampleName,
}: {
    apiDefinition: ApiDefinition.ApiDefinition;
    method: string;
    path: string;
    example: string | undefined;
}): ApiDefinition.EndpointDefinition | undefined {
    path = path.startsWith("/") ? path : `/${path}`;
    const matchingEndpoints = Object.values(apiDefinition.endpoints).filter(
        (e) => e.method === method && getMatchablePermutationsForEndpoint(e).has(path),
    );

    if (exampleName != null && matchingEndpoints.length > 1) {
        return (
            matchingEndpoints.find((e) => e.examples?.some(createExampleNamePredicate(exampleName))) ??
            matchingEndpoints[0]
        );
    }

    return matchingEndpoints[0];
}

function createExampleNamePredicate(exampleName: string): (example: ApiDefinition.ExampleEndpointCall) => boolean {
    return (example) =>
        example.name === exampleName ||
        Object.values(example.snippets ?? {})
            .flat()
            .some((snippet) => snippet.name === exampleName);
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
