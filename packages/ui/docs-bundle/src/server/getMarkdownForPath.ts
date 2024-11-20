import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { EndpointDefinition, TypeDefinition, TypeShape } from "@fern-api/fdr-sdk/api-definition";
import { MarkdownText } from "@fern-api/fdr-sdk/docs";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { FeatureFlags } from "@fern-ui/fern-docs-utils";
import { isString } from "es-toolkit";
import { DocsLoader } from "./DocsLoader";
import { pascalCaseHeaderKey } from "./headerKeyCase";
import { convertToLlmTxtMarkdown } from "./llm-txt-md";
import { removeLeadingSlash } from "./removeLeadingSlash";

export async function getMarkdownForPath(
    node: FernNavigation.NavigationNodePage,
    loader: DocsLoader,
    featureFlags: FeatureFlags,
): Promise<{ content: string; contentType: "markdown" | "mdx" } | undefined> {
    loader = loader.withFeatureFlags(featureFlags);
    const pages = await loader.pages();

    if (FernNavigation.isApiLeaf(node)) {
        const apiDefinition = await loader.getApiDefinition(node.apiDefinitionId);
        if (apiDefinition == null) {
            return undefined;
        }

        if (node.type === "endpoint") {
            const endpoint = apiDefinition.endpoints[node.endpointId];
            if (endpoint == null) {
                return undefined;
            }
            return {
                content: endpointDefinitionToMarkdown(
                    endpoint,
                    apiDefinition.globalHeaders,
                    apiDefinition.types,
                    node.title,
                ),
                contentType: "mdx",
            };
        }
    }

    const pageId = FernNavigation.getPageId(node);
    if (pageId == null) {
        return undefined;
    }

    const page = pages[pageId];
    if (!page) {
        return undefined;
    }

    return {
        content: convertToLlmTxtMarkdown(page.markdown, node.title, pageId.endsWith(".mdx") ? "mdx" : "md"),
        contentType: pageId.endsWith(".mdx") ? "mdx" : "markdown",
    };
}

export function getPageNodeForPath(
    root: FernNavigation.RootNode | undefined,
    path: string,
): FernNavigation.NavigationNodePage | undefined {
    if (root == null) {
        return undefined;
    }
    const found = FernNavigation.utils.findNode(root, FernNavigation.Slug(removeLeadingSlash(path)));
    if (found.type !== "found" || !FernNavigation.isPage(found.node)) {
        return undefined;
    }
    return found.node;
}

// function getPageInfo(
//     root: FernNavigation.RootNode | undefined,
//     slug: FernNavigation.Slug,
// ):
//     | {
//           nodeTitle: string;
//           pageId?: FernNavigation.PageId;
//           apiLeaf?: FernNavigation.NavigationNodeApiLeaf;
//       }
//     | undefined {
//     if (root == null) {
//         return undefined;
//     }

//     const foundNode = FernNavigation.utils.findNode(root, slug);
//     if (foundNode == null || foundNode.type !== "found" || !FernNavigation.isPage(foundNode.node)) {
//         return undefined;
//     }

//     if (FernNavigation.isApiLeaf(foundNode.node)) {
//         return {
//             nodeTitle: foundNode.node.title,
//             apiLeaf: foundNode.node,
//         };
//     }

//     const pageId = FernNavigation.getPageId(foundNode.node);
//     if (pageId == null) {
//         return undefined;
//     }

//     return {
//         nodeTitle: foundNode.node.title,
//         pageId,
//     };
// }

export function endpointDefinitionToMarkdown(
    endpoint: EndpointDefinition,
    globalHeaders: ApiDefinition.ObjectProperty[] | undefined,
    types: Record<FernNavigation.TypeId, TypeDefinition>,
    nodeTitle: string,
): string {
    const headers = [...(endpoint.requestHeaders ?? []), ...(globalHeaders ?? [])];
    return [
        `# ${nodeTitle}`,
        [
            "```http",
            `${endpoint.method} ${endpoint.environments?.find((env) => env.id === endpoint.defaultEnvironment)?.baseUrl ?? endpoint.environments?.[0]?.baseUrl ?? ""}${ApiDefinition.toCurlyBraceEndpointPathLiteral(endpoint.path)}`,
            endpoint.request != null ? `Content-Type: ${endpoint.request.contentType}` : undefined,
            "```",
        ]
            .filter(isNonNullish)
            .join("\n"),
        typeof endpoint.description === "string" ? endpoint.description : undefined,
        headers.length ? "## Request Headers" : undefined,
        headers
            ?.map(
                (header) =>
                    `- ${pascalCaseHeaderKey(header.key)}${getShorthand(header.valueShape, types, header.description)}`,
            )
            .join("\n"),
        endpoint.pathParameters?.length ? "## Path Parameters" : undefined,
        endpoint.pathParameters
            ?.map(
                (param) =>
                    `- ${pascalCaseHeaderKey(param.key)}${getShorthand(param.valueShape, types, param.description)}`,
            )
            .join("\n"),
        endpoint.queryParameters?.length ? "## Query Parameters" : undefined,
        endpoint.queryParameters
            ?.map(
                (param) =>
                    `- ${pascalCaseHeaderKey(param.key)}${getShorthand(param.valueShape, types, param.description)}`,
            )
            .join("\n"),
        endpoint.request != null ? "## Request Body" : undefined,
        typeof endpoint.request?.description === "string" ? endpoint.request?.description : undefined,
        endpoint.request != null ? `\`\`\`json\n${JSON.stringify(endpoint.request.body)}\n\`\`\`` : undefined,
        endpoint.responseHeaders?.length ? "## Response Headers" : undefined,
        endpoint.responseHeaders
            ?.map(
                (header) =>
                    `- ${pascalCaseHeaderKey(header.key)}${getShorthand(header.valueShape, types, header.description)}`,
            )
            .join("\n"),
        endpoint.response != null || endpoint.errors?.length ? "## Response Body" : undefined,
        endpoint.response != null || endpoint.errors?.length
            ? [
                  typeof endpoint.response?.description === "string"
                      ? `- ${endpoint.response.statusCode}: ${endpoint.response?.description}`
                      : undefined,
                  ...(endpoint.errors
                      ?.filter((error) => typeof error.description === "string")
                      .map((error) => `- ${error.statusCode}: ${error.description}`) ?? []),
              ].join("\n")
            : undefined,

        "## Examples",
        endpoint.examples
            ?.flatMap((example) =>
                Object.entries(example.snippets ?? {}).flatMap(([language, snippets]) =>
                    snippets.map(
                        (snippet) =>
                            ({
                                language,
                                snippet,
                                name: snippet.name ?? example.name,
                            }) as const,
                    ),
                ),
            )
            .map(
                ({ language, snippet, name }) =>
                    `\`\`\`${language === "curl" ? "shell" : language}${name != null ? ` ${name}` : ""}\n${snippet.code}\n\`\`\``,
            )
            .join("\n\n"),
    ]
        .filter(isNonNullish)
        .join("\n\n");
}

function getShorthand(
    shape: TypeShape,
    types: Record<FernNavigation.TypeId, TypeDefinition>,
    shapeDescription: MarkdownText | undefined,
): string | undefined {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    const description = [shapeDescription, ...unwrapped.descriptions].filter(isString)[0];
    if (unwrapped.isOptional) {
        return description ? ` (optional): ${description}` : " (optional)";
    }

    return description ? ` (required): ${description}` : " (required)";
}
