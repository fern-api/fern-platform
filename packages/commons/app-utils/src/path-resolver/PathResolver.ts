import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "../slug";
import { buildResolutionMap } from "./build-map";
import { buildDefinitionTree } from "./build-tree";
import type { DefinitionNode, FullSlug, NavigatableDefinitionNode } from "./types";
import { isLeafNode, traversePreOrder } from "./util";

export interface PathResolverConfig {
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}

export class PathResolver {
    readonly #tree: DefinitionNode.Root;
    readonly #map: Map<FullSlug, DefinitionNode | DefinitionNode[]>;
    public readonly rootNavigatable: NavigatableDefinitionNode | undefined;

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

    public resolveSlug(fullSlug: FullSlug): DefinitionNode | undefined {
        const nodeOrNodes = this.#map.get(fullSlug);
        if (Array.isArray(nodeOrNodes)) {
            const collisions = nodeOrNodes.map((node) => node.type);
            throw new Error(
                `Slug cannot be resolved due to ${
                    collisions.length
                } collisions.\nColliding node types: ${collisions.join(", ")}`
            );
        }
        return nodeOrNodes;
    }

    public resolveNavigatable(fullSlug: FullSlug): NavigatableDefinitionNode | undefined;
    public resolveNavigatable(node: DefinitionNode): NavigatableDefinitionNode;
    public resolveNavigatable(slugOrNode: string | DefinitionNode): NavigatableDefinitionNode | undefined {
        const node = typeof slugOrNode === "string" ? this.resolveSlug(slugOrNode) : slugOrNode;
        return node != null ? this.#resolveNavigatable(node) : undefined;
    }

    #resolveNavigatable(node: DefinitionNode): NavigatableDefinitionNode | undefined {
        if (isLeafNode(node)) {
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

    public traverse(cb: (node: DefinitionNode, fullSlug: FullSlug) => void): void {
        traversePreOrder(this.#tree, (node, slugs) => cb(node, joinUrlSlugs(...slugs)), []);
    }

    public getAllSlugs(): FullSlug[] {
        return Array.from(this.#map.keys());
    }

    public getCollidingNodes(): Map<string, DefinitionNode[]> {
        const nodesBySlug = new Map<string, DefinitionNode[]>();
        this.#map.forEach((val, key) => {
            if (Array.isArray(val)) {
                nodesBySlug.set(key, val);
            }
        });
        return nodesBySlug;
    }
}
