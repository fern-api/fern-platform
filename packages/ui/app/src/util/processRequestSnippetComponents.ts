import { APIV1Read } from "@fern-api/fdr-sdk";
import { flattenApiDefinition } from "./flattenApiDefinition";
import { resolveApiDefinition, ResolvedEndpointDefinition, ResolvedRootPackage } from "./resolver";

const REQUEST_SNIPPET = "<RequestSnippet";
const ENDPOINT_PARAMETER: RegExp = /endpoint="([^"]+)"/;

interface Substitution {
    index: number;
    endIndex: number;
    requestSnippetDefinition: string;
}

export async function processRequestSnippetComponents({
    content,
    apis,
}: {
    content: string;
    apis: Record<string, APIV1Read.ApiDefinition>;
}): Promise<string> {
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

        const endpointDefinition = await getEndpointDefinition({ apis, method, path });
        if (endpointDefinition == null) {
            continue;
        }

        const updatedRequestSnippet = `<RequestSnippet method="${endpointDefinition.method}" path=${JSON.stringify(endpointDefinition.path)}>`;
    }

    return content;
}

async function getEndpointDefinition({
    apis,
    method,
    path,
}: {
    apis: Record<string, APIV1Read.ApiDefinition>;
    method: string;
    path: string;
}): Promise<ResolvedEndpointDefinition | undefined> {
    for (const api of Object.values(apis)) {
        const flattenedApiDefinition = flattenApiDefinition(api, ["dummy"]);
        const resolvedApi = await resolveApiDefinition(flattenedApiDefinition);
        const endpoint = findEndpoint({ api: resolvedApi, method, path });
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
    api: ResolvedRootPackage;
    method: string;
    path: string;
}): ResolvedEndpointDefinition | undefined {
    for (const endpoint of api.endpoints) {
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

function getPathFromEndpoint(endpoint: ResolvedEndpointDefinition): string {
    const parts: string[] = [];
    for (const part of endpoint.path) {
        if (part.type === "literal") {
            parts.push(part.value);
        }
        if (part.type === "pathParameter") {
            parts.push(`{${part.key}}`);
        }
    }
    return parts.join("/");
}
