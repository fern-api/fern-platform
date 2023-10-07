import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { buildDefinitionMap } from "./build-map";
import { buildDefinitionTree } from "./build-tree";
import type { DefinitionNode, FullSlug, NavigatableDefinitionNode } from "./types";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

/**
 * A data structure that takes a docs definition and uses
 */
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
        let cur: DefinitionNode | undefined = node;
        while (cur != null) {
            if (cur.type === "endpoint" || cur.type === "page") {
                return cur;
            }
            const firstChildSlug: string | undefined = cur.childrenOrdering[0];
            cur = firstChildSlug != null ? cur.children.get(firstChildSlug) : undefined;
        }
        return undefined;
    }

    public getAllSlugs(): FullSlug[] {
        return Array.from(this.#nodesByFullSlug.keys());
    }
}
