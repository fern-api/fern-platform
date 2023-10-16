import { getFullSlugForNavigatable, joinUrlSlugs } from "../slug";
import { buildResolutionMap } from "./build-map";
import { buildNodeToNeighborsMap } from "./build-neighbors";
import { buildDefinitionTree } from "./build-tree";
import { PathCollisionError } from "./errors";
import type { DocsDefinitionSummary, DocsNode, FullSlug, NavigatableDocsNode, NodeNeighbors } from "./types";
import { isNavigatableNode, traversePreOrder } from "./util";

export interface PathResolverConfig {
    definition: DocsDefinitionSummary;
}

export class PathResolver {
    readonly #tree: DocsNode.Root;
    readonly #map: Map<FullSlug, DocsNode | DocsNode[]>;
    readonly #nodeToNeighbors: Map<FullSlug, NodeNeighbors>;
    public readonly rootNavigatable: NavigatableDocsNode | undefined;

    public constructor(public readonly config: PathResolverConfig) {
        const { tree, map, nodeToNeighbors } = this.#preprocessDefinition();
        this.#tree = tree;
        this.#map = map;
        this.#nodeToNeighbors = nodeToNeighbors;
        this.rootNavigatable = this.#resolveNavigatable(this.#tree);
    }

    #preprocessDefinition() {
        const tree = buildDefinitionTree(this.config.definition);
        const map = buildResolutionMap(tree);
        const nodeToNeighbors = buildNodeToNeighborsMap(tree);
        return { tree, map, nodeToNeighbors };
    }

    public resolveNavigatable(slugOrNode: string | DocsNode): NavigatableDocsNode | undefined {
        const node = typeof slugOrNode === "string" ? this.resolveSlug(slugOrNode) : slugOrNode;
        return node != null ? this.#resolveNavigatable(node) : undefined;
    }

    #resolveNavigatable(node: DocsNode): NavigatableDocsNode | undefined {
        if (isNavigatableNode(node)) {
            return node;
        }
        for (const childSlug of node.childrenOrdering) {
            const childNode = node.children[childSlug];
            if (childNode != null) {
                const foundNode = this.#resolveNavigatable(childNode);
                if (foundNode != null) {
                    return foundNode;
                }
            }
        }
        return undefined;
    }

    public resolveSlug(fullSlug: FullSlug): DocsNode | undefined {
        const nodeOrNodes = this.#map.get(fullSlug);
        if (Array.isArray(nodeOrNodes)) {
            throw new PathCollisionError(fullSlug, nodeOrNodes);
        }
        return nodeOrNodes;
    }

    public traverse(cb: (node: DocsNode, fullSlug: FullSlug) => void): void {
        traversePreOrder(this.#tree, (node, slugs) => cb(node, joinUrlSlugs(...slugs)), []);
    }

    public getAllSlugs(): FullSlug[] {
        return Array.from(this.#map.keys());
    }

    public getAllSlugsWithLeadingSlash(): string[] {
        return this.getAllSlugs().map((slug) => `/${slug}`);
    }

    public getAllSlugsWithBaseURL(baseUrl: string): string[] {
        return this.getAllSlugs().map((slug) => {
            if (baseUrl.startsWith("https://")) {
                return joinUrlSlugs(baseUrl, slug);
            }
            return joinUrlSlugs(`https://${baseUrl}`, slug);
        });
    }

    public getCollisions(): Map<string, DocsNode[]> {
        const nodesBySlug = new Map<string, DocsNode[]>();
        this.#map.forEach((val, key) => {
            if (Array.isArray(val)) {
                nodesBySlug.set(key, val);
            }
        });
        return nodesBySlug;
    }

    public getNeighborsForNavigatable(fullSlugOrNode: string | NavigatableDocsNode): NodeNeighbors {
        const fullSlug =
            typeof fullSlugOrNode === "string" ? fullSlugOrNode : getFullSlugForNavigatable(fullSlugOrNode);
        const neighbors = this.#nodeToNeighbors.get(fullSlug);
        return neighbors ?? { previous: null, next: null };
    }
}
