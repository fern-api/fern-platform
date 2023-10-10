import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "../slug";
import { buildResolutionMap } from "./build-map";
import { buildDefinitionTree } from "./build-tree";
import { PathCollisionError } from "./errors";
import type { DocsNode, FullSlug, NavigatableDocsNode } from "./types";
import { isLeafNode, traversePreOrder } from "./util";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    readonly #tree: DocsNode.Root;
    readonly #map: Map<FullSlug, DocsNode | DocsNode[]>;
    public readonly rootNavigatable: NavigatableDocsNode | undefined;

    public constructor(public readonly config: PathResolverConfig) {
        const { tree, map } = this.#preprocessDefinition();
        this.#tree = tree;
        this.#map = map;
        this.rootNavigatable = this.#resolveNavigatable(this.#tree);
    }

    #preprocessDefinition() {
        const tree = buildDefinitionTree(this.config.docsDefinition);
        const map = buildResolutionMap(tree);
        return { tree, map };
    }

    public resolveNavigatable(fullSlug: FullSlug): NavigatableDocsNode | undefined;
    public resolveNavigatable(node: DocsNode): NavigatableDocsNode;
    public resolveNavigatable(slugOrNode: string | DocsNode): NavigatableDocsNode | undefined {
        const node = typeof slugOrNode === "string" ? this.resolveSlug(slugOrNode) : slugOrNode;
        return node != null ? this.#resolveNavigatable(node) : undefined;
    }

    #resolveNavigatable(node: DocsNode): NavigatableDocsNode | undefined {
        if (isLeafNode(node)) {
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

    public getCollidingNodes(): Map<string, DocsNode[]> {
        const nodesBySlug = new Map<string, DocsNode[]>();
        this.#map.forEach((val, key) => {
            if (Array.isArray(val)) {
                nodesBySlug.set(key, val);
            }
        });
        return nodesBySlug;
    }
}
