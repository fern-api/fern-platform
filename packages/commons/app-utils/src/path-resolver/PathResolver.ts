import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { buildDefinitionMap } from "./build-map";
import { buildDefinitionTree } from "./build-tree";
import type { DefinitionNode, FullSlug, NavigatableDefinitionNode } from "./types";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    readonly #tree: DefinitionNode.Root;
    readonly #nodesByFullSlug: Map<FullSlug, DefinitionNode>;
    public readonly rootNavigatable: NavigatableDefinitionNode | undefined;

    public constructor(public readonly config: PathResolverConfig) {
        const { tree, map } = this.#preprocessDefinition();
        this.#tree = tree;
        this.#nodesByFullSlug = map;
        this.rootNavigatable = this.#resolveNavigatable(this.#tree);
    }

    #preprocessDefinition() {
        const tree = buildDefinitionTree(this.config.docsDefinition);
        const map = buildDefinitionMap(tree);
        return { tree, map };
    }

    public resolveSlug(fullSlug: FullSlug): DefinitionNode | undefined {
        return this.#nodesByFullSlug.get(fullSlug);
    }

    public resolveNavigatable(fullSlug: FullSlug): NavigatableDefinitionNode | undefined;
    public resolveNavigatable(node: DefinitionNode): NavigatableDefinitionNode;
    public resolveNavigatable(slugOrNode: string | DefinitionNode): NavigatableDefinitionNode | undefined {
        const node = typeof slugOrNode === "string" ? this.#nodesByFullSlug.get(slugOrNode) : slugOrNode;
        return node != null ? this.#resolveNavigatable(node) : undefined;
    }

    #resolveNavigatable(node: DefinitionNode): NavigatableDefinitionNode | undefined {
        if (node.type === "page" || node.type === "endpoint" || node.type === "webhook") {
            return node;
        }
        for (const childSlug of node.childrenOrdering) {
            const childNode = node.children.get(childSlug);
            if (childNode != null) {
                const foundNode = this.#resolveNavigatable(childNode);
                if (foundNode != null) {
                    return foundNode;
                }
            }
        }
        return undefined;
    }

    public getAllSlugs(): FullSlug[] {
        return Array.from(this.#nodesByFullSlug.keys());
    }
}
