import type { DocsNode, FdrAPI, NavigatableDocsNode, PathResolver } from "@fern-api/fdr-sdk";
import type { ResolvedPath } from "./ResolvedPath";
import { serializeNavigatableNode } from "./serialize-node";
import { getFullSlugForNavigatable } from "./slug";

export async function convertNavigatableToResolvedPath({
    resolver,
    navigatable,
    docsDefinition,
    basePath,
}: {
    resolver: PathResolver;
    navigatable: NavigatableDocsNode;
    docsDefinition: FdrAPI.docs.v1.read.DocsDefinition;
    basePath: string | undefined;
}): Promise<ResolvedPath> {
    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true, basePath });
    const serializedNavigatable = await serializeNavigatableNode({
        node: navigatable,
        docsDefinition,
    });
    const neighbors = resolver.getNeighborsForNavigatable(navigatable);
    const prev =
        neighbors.previous != null
            ? {
                  fullSlug: getFullSlugForNavigatable(resolver.resolveNavigatable(neighbors.previous.slug), {
                      omitDefault: true,
                      basePath,
                  }),
                  title: getTitle(neighbors.previous),
              }
            : null;
    const next =
        neighbors.next != null
            ? {
                  fullSlug: getFullSlugForNavigatable(resolver.resolveNavigatable(neighbors.next.slug), {
                      omitDefault: true,
                      basePath,
                  }),
                  title: getTitle(neighbors.next),
              }
            : null;

    switch (serializedNavigatable.type) {
        case "page":
            return {
                type: "custom-markdown-page",
                fullSlug,
                page: serializedNavigatable.page,
                sectionTitle: serializedNavigatable.section?.title ?? null,
                serializedMdxContent: serializedNavigatable.serializedMdxContent,
                editThisPageUrl: serializedNavigatable.editThisPageUrl,
                neighbors: {
                    prev: isNeighbor(prev) ? prev : null,
                    next: isNeighbor(next) ? next : null,
                },
            };
        case "endpoint":
        case "top-level-endpoint":
        case "webhook":
        case "top-level-webhook":
            return {
                type: "api-page",
                fullSlug,
                apiSection: serializedNavigatable.section,
                neighbors: {
                    prev: isNeighbor(prev) ? prev : null,
                    next: isNeighbor(next) ? next : null,
                },
            };
    }
}

function getTitle(docsNode: DocsNode): string | null {
    switch (docsNode.type) {
        case "docs-section":
        case "api-section":
        case "api-subpackage":
            return docsNode.section.title;
        case "page":
            return docsNode.page.title;
        case "top-level-endpoint":
        case "endpoint":
            return (
                docsNode.endpoint.name ??
                "/" +
                    docsNode.endpoint.path.parts
                        .map((part) => (part.type === "literal" ? part.value : `:${part.value}`))
                        .join("/")
            );
        case "top-level-webhook":
        case "webhook":
            return docsNode.webhook.name ?? "/" + docsNode.webhook.path.join("/");
        default:
            return null;
    }
}

function isNeighbor(node: { fullSlug: string; title: string | null } | null): node is ResolvedPath.Neighbor {
    return node?.title != null;
}
