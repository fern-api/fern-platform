import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { buildNodeMap } from "./build-map";
import { buildDocsDefinitionTree } from "./build-tree";
import type { FullSlug, ResolvedNavigatableNode, ResolvedNode } from "./types";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    private readonly root: ResolvedNode.Root;
    private readonly nodesByFullSlug: Map<FullSlug, ResolvedNode>;

    public get rootNavigatable(): ResolvedNavigatableNode | undefined {
        return this.#resolveNavigatable(this.root);
    }

    public constructor(public readonly config: PathResolverConfig) {
        const { tree, map } = this.preprocessDefinition();
        this.root = tree;
        this.nodesByFullSlug = map;
    }

    private preprocessDefinition() {
        const tree = buildDocsDefinitionTree(this.config.docsDefinition);
        const map = buildNodeMap(tree);
        return { tree, map };
    }

    public resolveSlug(slug: FullSlug): ResolvedNode | undefined {
        return this.nodesByFullSlug.get(slug);
    }

    public resolveNavigatable(slug: string): ResolvedNavigatableNode | undefined;
    public resolveNavigatable(resolvedNode: ResolvedNode): ResolvedNavigatableNode;
    public resolveNavigatable(slugOrNode: string | ResolvedNode): ResolvedNavigatableNode | undefined {
        const resolvedNode = typeof slugOrNode === "string" ? this.nodesByFullSlug.get(slugOrNode) : slugOrNode;
        return resolvedNode != null ? this.#resolveNavigatable(resolvedNode) : undefined;
    }

    #resolveNavigatable(resolvedNode: ResolvedNode): ResolvedNavigatableNode | undefined {
        let cur: ResolvedNode | undefined = resolvedNode;
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
