import { getFullSlugForNavigatable, NavigatableDocsNode, serializeNavigatableNode } from "@fern-ui/app-utils";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import type { ResolvedPath } from "@fern-ui/ui";

export async function convertNavigatableToResolvedPath({
    navigatable,
    docsDefinition,
}: {
    navigatable: NavigatableDocsNode;
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
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
