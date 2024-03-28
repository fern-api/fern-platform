import { ResolvedEndpointDefinition, ResolvedWithApiDefinition } from "./resolver";

// const REQUEST_SNIPPET = "<RequestSnippet";
// const ENDPOINT_PARAMETER: RegExp = /endpoint="([^"]+)"/;

// interface Substitution {
//     index: number;
//     endIndex: number;
//     requestSnippetDefinition: string;
// }

// export async function processRequestSnippetComponents({
//     content,
//     apis,
// }: {
//     content: string;
//     apis: Record<string, APIV1Read.ApiDefinition>;
// }): Promise<string> {
//     let index = -1;

//     const transformedContent = content;

//     while ((index = content.indexOf(REQUEST_SNIPPET, index + 1)) !== -1) {
//         const endIndex = content.indexOf("/>", index + 1);
//         const requestSnippetDefinition = content.substring(index, endIndex + 1);

//         const match: RegExpMatchArray | null = requestSnippetDefinition.match(ENDPOINT_PARAMETER);
//         if (match == null) {
//             continue;
//         }

//         const endpoint = match[1]?.split(" ");
//         if (endpoint == null || endpoint[0] == null || endpoint[1] == null) {
//             continue;
//         }

//         const method = endpoint[0];
//         const path = endpoint[1];

//         const endpointDefinition = await getEndpointDefinition({ apis, method, path });
//         if (endpointDefinition == null) {
//             continue;
//         }

//         const updatedRequestSnippet = `<RequestSnippet method="${endpointDefinition.method}" path=${JSON.stringify(endpointDefinition.path)}>`;
//     }

//     return content;
// }

// async function getEndpointDefinition({
//     apis,
//     method,
//     path,
// }: {
//     apis: Record<string, APIV1Read.ApiDefinition>;
//     method: string;
//     path: string;
// }): Promise<ResolvedEndpointDefinition | undefined> {
//     for (const api of Object.values(apis)) {
//         const flattenedApiDefinition = flattenApiDefinition(api, ["dummy"]);
//         const resolvedApi = await resolveApiDefinition(flattenedApiDefinition);
//         const endpoint = findEndpoint({ api: resolvedApi, method, path });
//         if (endpoint != null) {
//             return endpoint;
//         }
//     }
//     return undefined;
// }

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
        if (
            item.type === "endpoint" &&
            (getPathFromEndpoint1(item) === path || getPathFromEndpoint2(item) === path) &&
            item.method === method
        ) {
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

function getPathFromEndpoint1(endpoint: ResolvedEndpointDefinition): string {
    const parts: string[] = [];
    for (const part of endpoint.path) {
        if (part.type === "literal") {
            parts.push(part.value);
        }
        if (part.type === "pathParameter") {
            parts.push(`{${part.key}}`);
        }
    }
    return parts.join("");
}

function getPathFromEndpoint2(endpoint: ResolvedEndpointDefinition): string {
    const parts: string[] = [];
    for (const part of endpoint.path) {
        if (part.type === "literal") {
            parts.push(part.value);
        }
        if (part.type === "pathParameter") {
            parts.push(`:${part.key}`);
        }
    }
    return parts.join("");
}
