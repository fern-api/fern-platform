import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { buildDefinitionMap } from "./build-map";
import { buildDefinitionTree } from "./build-tree";
import type { DefinitionNode, FullSlug, NavigatableDefinitionNode } from "./types";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    private readonly root: DefinitionNode.Root;
    private readonly nodesByFullSlug: Map<FullSlug, DefinitionNode>;

    public get rootNavigatable(): NavigatableDefinitionNode | undefined {
        return this.#resolveNavigatable(this.root);
    }

    public constructor(public readonly config: PathResolverConfig) {
        const { tree, map } = this.preprocessDefinition();
        this.root = tree;
        this.nodesByFullSlug = map;
    }

    private preprocessDefinition() {
        const tree = buildDefinitionTree(this.config.docsDefinition);
        const map = buildDefinitionMap(tree);
        return { tree, map };
    }

    public resolveSlug(slug: FullSlug): DefinitionNode | undefined {
        return this.nodesByFullSlug.get(slug);
    }

    public resolveNavigatable(slug: string): NavigatableDefinitionNode | undefined;
    public resolveNavigatable(node: DefinitionNode): NavigatableDefinitionNode;
    public resolveNavigatable(slugOrNode: string | DefinitionNode): NavigatableDefinitionNode | undefined {
        const node = typeof slugOrNode === "string" ? this.nodesByFullSlug.get(slugOrNode) : slugOrNode;
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
        return Array.from(this.nodesByFullSlug.keys());
    }
}
