import type { DocsNode, FdrAPI, NavigatableDocsNode, PathResolver } from "@fern-api/fdr-sdk";
import { flattenApiDefinition, FlattenedApiDefinition, FlattenedSubpackage } from "./flattenApiDefinition";
import { serializeMdxContent } from "./mdx";
import type { ResolvedPath } from "./ResolvedPath";
import { resolveApiDefinition } from "./resolver";
import { getFullSlugForNavigatable } from "./slug";

export async function convertNavigatableToResolvedPath({
    resolver,
    navigatable,
    docsDefinition,
    basePath,
    parentSlugs,
}: {
    resolver: PathResolver;
    navigatable: NavigatableDocsNode;
    docsDefinition: FdrAPI.docs.v1.read.DocsDefinition;
    basePath: string | undefined;
    parentSlugs: string[];
}): Promise<ResolvedPath | undefined> {
    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true, basePath });
    // const serializedNavigatable = await serializeNavigatableNode({
    //     node: navigatable,
    //     docsDefinition,
    // });
    const { previous, next } = resolver.getNeighborsForNavigatable(navigatable);
    const neighbors = {
        prev: getNeighbor(previous, resolver, basePath),
        next: getNeighbor(next, resolver, basePath),
    };

    switch (navigatable.type) {
        case "page": {
            const pageContent = docsDefinition.pages[navigatable.page.id];
            if (pageContent == null) {
                return;
            }
            return {
                type: "custom-markdown-page",
                fullSlug,
                page: navigatable.page,
                sectionTitle: navigatable.page.title,
                serializedMdxContent: await serializeMdxContent(pageContent.markdown),
                editThisPageUrl: pageContent.editThisPageUrl ?? null,
                neighbors,
            };
        }
        case "endpoint":
        case "top-level-endpoint":
        case "webhook":
        case "top-level-webhook":
        case "websocket":
        case "top-level-websocket": {
            const api = docsDefinition.apis[navigatable.section.api];
            if (api == null) {
                return;
            }
            const apiDefinitionParentSlug = navigatable.section.skipUrlSlug
                ? parentSlugs
                : [...parentSlugs, navigatable.section.urlSlug];
            const flattenedApiDefinition = flattenApiDefinition(api, apiDefinitionParentSlug);
            const prunedApiDefinition = findAndPruneApiSection(fullSlug, flattenedApiDefinition);

            return {
                type: "api-page",
                fullSlug,
                api: navigatable.section.api,
                apiDefinition: await resolveApiDefinition(prunedApiDefinition),
                artifacts: navigatable.section.artifacts ?? null,
                showErrors: navigatable.section.showErrors,
                neighbors,
                sectionUrlSlug: navigatable.section.urlSlug,
                skipUrlSlug: navigatable.section.skipUrlSlug,
            };
        }
    }
}

function findAndPruneApiSection(fullSlug: string, apiSection: FlattenedApiDefinition): FlattenedApiDefinition {
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

function findAndPruneApiSubpackage(fullSlug: string, subpackage: FlattenedSubpackage): FlattenedSubpackage {
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
