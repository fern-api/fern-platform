import type { FernRegistry, NavigatableDocsNode } from "@fern-api/fdr-sdk";
import { getFullSlugForNavigatable, serializeNavigatableNode } from "@fern-ui/app-utils";
import type { ResolvedPath } from "@fern-ui/ui";

export async function convertNavigatableToResolvedPath({
    navigatable,
    docsDefinition,
}: {
    navigatable: NavigatableDocsNode;
    docsDefinition: FernRegistry.docs.v1.read.DocsDefinition;
}): Promise<ResolvedPath> {
    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true });
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
