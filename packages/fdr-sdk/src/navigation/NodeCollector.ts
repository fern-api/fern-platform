import urljoin from "url-join";
import { once } from "../utils";
import { FernNavigation } from "./generated";
import {
    NavigationNode,
    NavigationNodeNeighbor,
    NavigationNodeWithMetadata,
    hasMarkdown,
    hasMetadata,
    isNeighbor,
    isPage,
} from "./types";
import { traverseNavigation } from "./utils";
import { pruneVersionNode } from "./utils/pruneVersionNode";

interface NavigationNodeWithMetadataAndParents {
    node: NavigationNodeWithMetadata;
    parents: NavigationNode[];
    next: NavigationNodeNeighbor | undefined;
    prev: NavigationNodeNeighbor | undefined;
}

const NodeCollectorInstances = new WeakMap<NavigationNode, NodeCollector>();

export class NodeCollector {
    private static readonly EMPTY = new NodeCollector(undefined);
    private idToNode = new Map<FernNavigation.NodeId, NavigationNode>();
    private idToNodeParents = new Map<FernNavigation.NodeId, NavigationNode[]>();
    private slugToNode = new Map<FernNavigation.Slug, NavigationNodeWithMetadataAndParents>();
    private orphanedNodes: NavigationNodeWithMetadata[] = [];

    public static collect(rootNode: NavigationNode | undefined): NodeCollector {
        if (rootNode == null) {
            return NodeCollector.EMPTY;
        }
        const existing = NodeCollectorInstances.get(rootNode);
        if (existing != null) {
            return existing;
        }
        const instance = new NodeCollector(rootNode);
        NodeCollectorInstances.set(rootNode, instance);
        return instance;
    }

    #last: NavigationNodeWithMetadataAndParents | undefined;
    #lastNeighboringNode: NavigationNodeNeighbor | undefined;
    #setNode(slug: FernNavigation.Slug, node: NavigationNodeWithMetadata, parents: NavigationNode[]) {
        const toSet = { node, parents, prev: this.#lastNeighboringNode, next: undefined };
        this.slugToNode.set(slug, toSet);

        if (isNeighbor(node) && !node.hidden) {
            this.#lastNeighboringNode = node;
            if (this.#last != null) {
                this.#last.next = node;
            }
            this.#last = toSet;
        }
    }

    private defaultVersion: FernNavigation.VersionNode | undefined;
    constructor(rootNode: NavigationNode | undefined) {
        if (rootNode == null) {
            return;
        }
        traverseNavigation(rootNode, (node, _index, parents) => {
            this.idToNode.set(node.id, node);
            this.idToNodeParents.set(node.id, parents);

            // if the node is the default version, make a copy of it and "prune" the version slug from all children nodes
            const parent = parents[parents.length - 1];
            if (
                node.type === "version" &&
                node.default &&
                parent != null &&
                parent.type === "versioned" &&
                rootNode.type === "root"
            ) {
                const copy = JSON.parse(JSON.stringify(node)) as FernNavigation.VersionNode;
                this.defaultVersion = pruneVersionNode(copy, rootNode.slug, node.slug);
                traverseNavigation(this.defaultVersion, (node, _index, innerParents) => {
                    this.visitNode(node, [...parents, ...innerParents]);
                });
            }

            this.visitNode(node, parents);
        });
    }

    private visitNode(node: NavigationNode, parents: NavigationNode[]): void {
        if (node.type === "sidebarRoot") {
            this.#last = undefined;
            this.#lastNeighboringNode = undefined;
        }

        // there's currently no visitable page for changelog months and years
        if (!hasMetadata(node) || node.type === "changelogMonth" || node.type === "changelogYear") {
            return;
        }

        const existing = this.slugToNode.get(node.slug);
        if (existing == null) {
            this.#setNode(node.slug, node, parents);
        } else if (!node.hidden && isPage(node) && (existing.node.hidden || !isPage(existing.node))) {
            this.orphanedNodes.push(existing.node);
            this.#setNode(node.slug, node, parents);
        } else {
            if (isPage(existing.node)) {
                // eslint-disable-next-line no-console
                console.warn(`Duplicate slug found: ${node.slug}`, node.title);
            }
            this.orphanedNodes.push(node);
        }
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

    get defaultVersionNode(): FernNavigation.VersionNode | undefined {
        return this.defaultVersion;
    }

    public get(id: FernNavigation.NodeId): NavigationNode | undefined {
        return this.idToNode.get(id);
    }

    public getParents(id: FernNavigation.NodeId): NavigationNode[] {
        return this.idToNodeParents.get(id) ?? [];
    }

    public getSlugMapWithParents = once((): Map<string, NavigationNodeWithMetadataAndParents> => {
        return new Map(Object.entries(this.slugToNode));
    });

    public getSlugs = once((): string[] => {
        return Object.keys(this.slugToNode);
    });

    /**
     * Returns a list of slugs for all pages in the navigation tree. This includes hidden pages.
     */
    public getPageSlugs = once((): string[] => {
        return Object.values(this.slugToNode)
            .filter(({ node }) => isPage(node))
            .map(({ node }) => urljoin(node.slug));
    });

    /**
     * Returns a list of slugs for pages that should be indexed by search engines, and by algolia.
     *
     * This excludes hidden pages and noindex pages.
     */
    public getIndexablePageSlugs = once((): string[] => {
        return Object.values(this.slugToNode)
            .filter(({ node }) => isPage(node) && node.hidden !== true)
            .filter(({ node }) => (hasMarkdown(node) ? node.noindex !== true : true))
            .map(({ node }) => urljoin(node.slug));
    });

    public getVersionNodes = once((): FernNavigation.VersionNode[] => {
        return [...this.idToNode.values()]
            .filter((node): node is FernNavigation.VersionNode => node.type === "version")
            .map((node) => node);
    });
}
