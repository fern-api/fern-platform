import type { DocsNode, FernRegistry, NavigatableDocsNode } from "@fern-api/fdr-sdk";
import { serializeMdxContent, type SerializedMdxContent } from "./mdx";

export type SerializedPageNode = DocsNode.Page & {
    serializedMdxContent: SerializedMdxContent;
};

export type SerializedNavigatableNode =
    | DocsNode.TopLevelEndpoint
    | DocsNode.Endpoint
    | DocsNode.TopLevelWebhook
    | DocsNode.Webhook
    | SerializedPageNode;

export async function serializePageNode({
    pageNode,
    docsDefinition,
    isPreview,
}: {
    pageNode: DocsNode.Page;
    docsDefinition: FernRegistry.docs.v1.read.DocsDefinition;
    isPreview?: boolean;
}): Promise<SerializedPageNode> {
    const pageContent = docsDefinition.pages[pageNode.page.id];
    if (pageContent == null) {
        throw new Error(`Cannot find page content for page "${pageNode.page.id}"`);
    }
    return {
        ...pageNode,
        serializedMdxContent: await serializeMdxContent(pageContent.markdown, isPreview),
    };
}

export async function serializeNavigatableNode({
    node,
    docsDefinition,
    isPreview,
}: {
    node: NavigatableDocsNode;
    docsDefinition: FernRegistry.docs.v1.read.DocsDefinition;
    isPreview?: boolean;
}): Promise<SerializedNavigatableNode> {
    return node.type === "page" ? await serializePageNode({ pageNode: node, docsDefinition, isPreview }) : node;
}
