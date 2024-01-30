import type { DocsNode, FdrAPI, NavigatableDocsNode } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { marked } from "marked";
import { serializeMdxContent, TableOfContentsItem, type SerializedMdxContent } from "./mdx";

export type SerializedPageNode = DocsNode.Page & {
    tableOfContents: TableOfContentsItem[];
    editThisPageUrl: string | null;
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
    docsDefinition: FdrAPI.docs.v1.read.DocsDefinition;
}): Promise<SerializedPageNode> {
    const pageContent = docsDefinition.pages[pageNode.page.id];
    if (pageContent == null) {
        throw new Error(`Cannot find page content for page "${pageNode.page.id}"`);
    }
    return {
        ...pageNode,
        tableOfContents: createTableOfContents(pageContent.markdown),
        editThisPageUrl: null,
        serializedMdxContent: await serializeMdxContent(pageContent.markdown),
    };
}

export async function serializeNavigatableNode({
    node,
    docsDefinition,
}: {
    node: NavigatableDocsNode;
    docsDefinition: FdrAPI.docs.v1.read.DocsDefinition;
}): Promise<SerializedNavigatableNode> {
    return node.type === "page" ? await serializePageNode({ pageNode: node, docsDefinition }) : node;
}

function createTableOfContents(markdown: string) {
    const headings = marked.lexer(markdown).filter(isHeading);
    const minDepth = Math.min(...headings.map((heading) => heading.depth));

    return makeTree(headings, minDepth);
}

const makeTree = (headings: marked.Tokens.Heading[], depth: number = 1): TableOfContentsItem[] => {
    const tree: TableOfContentsItem[] = [];

    while (headings.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const firstToken = headings[0]!;

        // if the next heading is at a higher level
        if (firstToken.depth < depth) {
            break;
        }

        if (firstToken.depth === depth) {
            const token = headings.shift();
            const simpleString = token != null ? tokenToSimpleString(token) : "";
            tree.push({
                // heading: simpleString.length > 0 ? token : undefined,
                simpleString,
                children: makeTree(headings, depth + 1),
            });
        } else {
            tree.push({
                // heading: undefined,
                simpleString: "",
                children: makeTree(headings, depth + 1),
            });
        }
    }

    return tree;
};

function isHeading(token: marked.Token): token is marked.Tokens.Heading {
    return token.type === "heading" && tokenToSimpleString(token).length > 0;
}

function tokenToSimpleString(token: marked.Token): string {
    return visitDiscriminatedUnion(token, "type")._visit({
        space: () => "",
        code: (value) => value.text,
        heading: (value) => value.tokens.map(tokenToSimpleString).join(""),
        table: () => "",
        hr: () => "",
        blockquote: (value) => value.tokens.map(tokenToSimpleString).join(""),
        list: (value) => value.items.map(tokenToSimpleString).join(""),
        list_item: (value) => value.tokens.map(tokenToSimpleString).join(""),
        paragraph: (value) => value.tokens.map(tokenToSimpleString).join(""),
        html: (value) => value.text,
        text: (value) => value.raw,
        def: (value) => value.title,
        escape: (value) => value.text,
        image: (value) => value.text,
        link: (value) => value.text,
        strong: (value) => value.text,
        em: (value) => value.text,
        codespan: (value) => value.text,
        br: () => "",
        del: (value) => value.text,
        _other: () => "",
    });
}
