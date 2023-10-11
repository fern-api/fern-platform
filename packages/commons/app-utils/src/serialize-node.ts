import { type SerializedMdxContent, serializeMdxContent } from "./mdx";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import type { DocsNode, NavigatableDocsNode } from "./path-resolver";

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
}: {
    pageNode: DocsNode.Page;
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}): Promise<SerializedPageNode> {
    const pageContent = docsDefinition.pages[pageNode.page.id];
    if (pageContent == null) {
        throw new Error(`Cannot find page content for page "${pageNode.page.id}"`);
    }
    return {
        ...pageNode,
        serializedMdxContent: await serializeMdxContent(pageContent.markdown),
    };
}

export async function serializeNavigatableNode({
    node,
    docsDefinition,
}: {
    node: NavigatableDocsNode;
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}): Promise<SerializedNavigatableNode> {
    return node.type === "page" ? await serializePageNode({ pageNode: node, docsDefinition }) : node;
}
