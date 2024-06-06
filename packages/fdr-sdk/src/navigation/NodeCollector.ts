import { once } from "@/utils";
import urljoin from "url-join";
import { FernNavigation } from "./generated";
import {
    NavigationNode,
    NavigationNodeNeighbor,
    NavigationNodeWithMetadata,
    hasMetadata,
    isNeighbor,
    isPage,
} from "./types";
import { traverseNavigation } from "./utils";

interface NavigationNodeWithMetadataAndParents {
    node: NavigationNodeWithMetadata;
    parents: NavigationNode[];
    next: NavigationNodeNeighbor | undefined;
    prev: NavigationNodeNeighbor | undefined;
}

export class NodeCollector {
    private idToNode = new Map<FernNavigation.NodeId, NavigationNode>();
    private slugToNode: Record<FernNavigation.Slug, NavigationNodeWithMetadataAndParents> = {};
    private orphanedNodes: NavigationNodeWithMetadata[] = [];

    public static collect(rootNode: NavigationNode): NodeCollector {
        return new NodeCollector(rootNode);
    }

    #last: NavigationNodeWithMetadataAndParents | undefined;
    #lastNeighboringNode: NavigationNodeNeighbor | undefined;
    #setNode(slug: FernNavigation.Slug, node: NavigationNodeWithMetadata, parents: NavigationNode[]) {
        const toSet = { node, parents, prev: this.#lastNeighboringNode, next: undefined };
        this.slugToNode[slug] = toSet;

        if (isNeighbor(node) && !node.hidden) {
            this.#lastNeighboringNode = node;
            if (this.#last != null) {
                this.#last.next = node;
            }
            this.#last = toSet;
        }
    }

    constructor(rootNode: NavigationNode) {
        traverseNavigation(rootNode, (node, _index, parents) => {
            this.idToNode.set(node.id, node);
            if (node.type === "sidebarRoot") {
                this.#last = undefined;
                this.#lastNeighboringNode = undefined;
            }

            if (!hasMetadata(node)) {
                return;
            }
            const existing = this.slugToNode[node.slug];
            if (existing == null) {
                this.#setNode(node.slug, node, parents);
            } else if (!node.hidden && isPage(node) && (existing.node.hidden || !isPage(existing.node))) {
                this.orphanedNodes.push(existing.node);
                this.#setNode(node.slug, node, parents);
            } else {
                if (isPage(existing.node)) {
                    // eslint-disable-next-line no-console
                    console.warn(`Duplicate slug found: ${node.slug}`);
                }
                this.orphanedNodes.push(node);
            }
        });
    }

    public getOrphanedNodes(): NavigationNodeWithMetadata[] {
        return this.orphanedNodes;
    }

    public getOrphanedPages = once((): NavigationNodeWithMetadata[] => {
        return this.orphanedNodes.filter(isPage);
    });

    private getSlugMap = once((): Map<string, NavigationNodeWithMetadata> => {
        return new Map(Object.entries(this.slugToNode).map(([slug, { node }]) => [slug, node]));
    });

    get slugMap(): Map<string, NavigationNodeWithMetadata> {
        return this.getSlugMap();
    }

    public get(id: FernNavigation.NodeId): NavigationNode | undefined {
        return this.idToNode.get(id);
    }

    public getSlugMapWithParents = once((): Map<string, NavigationNodeWithMetadataAndParents> => {
        return new Map(Object.entries(this.slugToNode));
    });

    public getSlugs = once((): string[] => {
        return Object.keys(this.slugToNode);
    });

    public getPageSlugs = once((): string[] => {
        return Object.values(this.slugToNode)
            .filter(({ node }) => isPage(node))
            .map(({ node }) => urljoin(node.slug));
    });

    public getVersionNodes = once((): FernNavigation.VersionNode[] => {
        return [...this.idToNode.values()]
            .filter((node): node is FernNavigation.VersionNode => node.type === "version")
            .map((node) => node);
    });
}
