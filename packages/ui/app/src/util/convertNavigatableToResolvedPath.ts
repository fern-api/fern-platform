import type { DocsNode, FdrAPI, NavigatableDocsNode, PathResolver } from "@fern-api/fdr-sdk";
import type { ResolvedPath } from "./ResolvedPath";
import { ResolvedNavigationItemApiSection, ResolvedSubpackage } from "./resolver";
import { serializeNavigatableNode } from "./serialize-node";
import { getFullSlugForNavigatable } from "./slug";

export async function convertNavigatableToResolvedPath({
    resolver,
    navigatable,
    docsDefinition,
    basePath,
    apiSections,
}: {
    resolver: PathResolver;
    navigatable: NavigatableDocsNode;
    docsDefinition: FdrAPI.docs.v1.read.DocsDefinition;
    basePath: string | undefined;
    apiSections: ResolvedNavigationItemApiSection[];
}): Promise<ResolvedPath> {
    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true, basePath });
    const serializedNavigatable = await serializeNavigatableNode({
        node: navigatable,
        docsDefinition,
    });
    const { previous, next } = resolver.getNeighborsForNavigatable(navigatable);
    const neighbors = {
        prev: getNeighbor(previous, resolver, basePath),
        next: getNeighbor(next, resolver, basePath),
    };

    switch (serializedNavigatable.type) {
        case "page":
            return {
                type: "custom-markdown-page",
                fullSlug,
                page: serializedNavigatable.page,
                sectionTitle: serializedNavigatable.section?.title ?? null,
                serializedMdxContent: serializedNavigatable.serializedMdxContent,
                editThisPageUrl: serializedNavigatable.editThisPageUrl,
                neighbors,
            };
        case "endpoint":
        case "top-level-endpoint":
        case "webhook":
        case "top-level-webhook":
        case "websocket":
        case "top-level-websocket": {
            const foundApiSection = apiSections.find(({ api }) => api === serializedNavigatable.section.api);
            if (foundApiSection == null) {
                throw new Error(`Could not find API section for API: ${serializedNavigatable.section.api}`);
            }
            return {
                type: "api-page",
                fullSlug,
                apiSection: findAndPruneApiSection(fullSlug, foundApiSection),
                neighbors,
            };
        }
    }
}

function findAndPruneApiSection(
    fullSlug: string,
    apiSection: ResolvedNavigationItemApiSection,
): ResolvedNavigationItemApiSection {
    return {
        ...apiSection,
        endpoints: apiSection.endpoints.filter((endpoint) => endpoint.slug.join("/") === fullSlug),
        websockets: apiSection.websockets.filter((websocket) => websocket.slug.join("/") === fullSlug),
        webhooks: apiSection.webhooks.filter((webhook) => webhook.slug.join("/") === fullSlug),
        subpackages: apiSection.subpackages
            .filter((subpackage) => fullSlug.startsWith(subpackage.slug.join("/")))
            .map((subpackage) => findAndPruneApiSubpackage(fullSlug, subpackage)),
    };
}

function findAndPruneApiSubpackage(fullSlug: string, subpackage: ResolvedSubpackage): ResolvedSubpackage {
    return {
        ...subpackage,
        endpoints: subpackage.endpoints.filter((endpoint) => endpoint.slug.join("/") === fullSlug),
        websockets: subpackage.websockets.filter((websocket) => websocket.slug.join("/") === fullSlug),
        webhooks: subpackage.webhooks.filter((webhook) => webhook.slug.join("/") === fullSlug),
        subpackages: subpackage.subpackages
            .filter((subpackage) => fullSlug.startsWith(subpackage.slug.join("/")))
            .map((subpackage) => findAndPruneApiSubpackage(fullSlug, subpackage)),
    };
}

function getNeighbor(
    docsNode: DocsNode | null,
    resolver: PathResolver,
    basePath: string | undefined,
): ResolvedPath.Neighbor | null {
    if (docsNode == null) {
        return null;
    }
    const slug = getFullSlugForNavigatable(resolver.resolveNavigatable(docsNode), { omitDefault: true, basePath });
    const title = getTitle(docsNode);
    return slug != null && title != null ? { fullSlug: slug, title } : null;
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
