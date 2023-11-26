import type { FernRegistry, NavigatableDocsNode } from "@fern-api/fdr-sdk";
import type { ResolvedPath } from "./ResolvedPath";
import { serializeNavigatableNode } from "./serialize-node";
import { getFullSlugForNavigatable } from "./slug";

export async function convertNavigatableToResolvedPath({
    navigatable,
    docsDefinition,
    basePath,
}: {
    navigatable: NavigatableDocsNode;
    docsDefinition: FernRegistry.docs.v1.read.DocsDefinition;
    basePath: string | undefined;
}): Promise<ResolvedPath> {
    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true, basePath });
    const serializedNavigatable = await serializeNavigatableNode({
        node: navigatable,
        docsDefinition,
    });
    switch (serializedNavigatable.type) {
        case "page":
            return {
                type: "custom-markdown-page",
                fullSlug,
                page: serializedNavigatable.page,
                sectionTitle: serializedNavigatable.section?.title ?? null,
                serializedMdxContent: serializedNavigatable.serializedMdxContent,
            };
        case "endpoint":
        case "top-level-endpoint":
        case "webhook":
        case "top-level-webhook":
            return {
                type: "api-page",
                fullSlug,
                apiSection: serializedNavigatable.section,
            };
    }
}
