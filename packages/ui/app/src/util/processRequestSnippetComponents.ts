import { APIV1Read } from "@fern-api/fdr-sdk";

const REQUEST_SNIPPET = "<RequestSnippet";
const ENDPOINT_PARAMETER: RegExp = /endpoint="([^"]+)"/;

interface Substitution {
    index: number;
    endIndex: number;
    requestSnippetDefinition: string;
}

export function processRequestSnippetComponents({
    content,
    apis,
}: {
    content: string;
    apis: Record<string, APIV1Read.ApiDefinition>;
}): string {
    let index = -1;

    const transformedContent = content;

    while ((index = content.indexOf(REQUEST_SNIPPET, index + 1)) !== -1) {
        const endIndex = content.indexOf("/>", index + 1);
        const requestSnippetDefinition = content.substring(index, endIndex + 1);

        const match: RegExpMatchArray | null = requestSnippetDefinition.match(ENDPOINT_PARAMETER);
        if (match == null) {
            continue;
        }

        const endpoint = match[1]?.split(" ");
        if (endpoint == null || endpoint[0] == null || endpoint[1] == null) {
            continue;
        }

        const method = endpoint[0];
        const path = endpoint[1];

        const endpointDefinition = getEndpointDefinition({ apis, method, path });
        if (endpointDefinition == null) {
            continue;
        }

        const updatedRequestSnippet = `<RequestSnippet method="${endpointDefinition.method}" path="${JSON.stringify(endpointDefinition)}">`;
    }

    return content;
}

function getEndpointDefinition({
    apis,
    method,
    path,
}: {
    apis: Record<string, APIV1Read.ApiDefinition>;
    method: string;
    path: string;
}): APIV1Read.EndpointDefinition | undefined {
    for (const api of Object.values(apis)) {
        const endpoint = findEndpoint({ api, method, path });
        if (endpoint != null) {
            return endpoint;
        }
    }
    return undefined;
}

function findEndpoint({
    api,
    method,
    path,
}: {
    api: APIV1Read.ApiDefinition;
    method: string;
    path: string;
}): APIV1Read.EndpointDefinition | undefined {
    for (const endpoint of api.rootPackage.endpoints) {
        if (getPathFromEndpoint(endpoint) === path && endpoint.method === method) {
            return endpoint;
        }
    }

    for (const [_, subpackage] of Object.entries(api.subpackages)) {
        for (const endpoint of subpackage.endpoints) {
            if (getPathFromEndpoint(endpoint) === path && endpoint.method === method) {
                return endpoint;
            }
        }
    }

    return undefined;
}

function getPathFromEndpoint(endpoint: APIV1Read.EndpointDefinition): string {
    const parts: string[] = [];
    for (const part of endpoint.path.parts) {
        if (part.type === "literal") {
            parts.push(part.value);
        }
        if (part.type === "pathParameter") {
            parts.push(`{${part.value}}`);
        }
    }
    return parts.join("/");
}
