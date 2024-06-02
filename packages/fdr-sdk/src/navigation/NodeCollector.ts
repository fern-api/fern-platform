import { once } from "lodash-es";
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

// lower number means higher priority
const PRIORITY_LIST: Record<NavigationNodeWithMetadata["type"], number> = {
    page: 0,
    endpoint: 0,
    webSocket: 0,
    webhook: 0,
    changelogEntry: 0,
    changelogYear: 1,
    changelogMonth: 1,
    changelog: 2,
    apiSection: 3,
    section: 3,
    apiReference: 3,
    tab: 5,
    version: 6,
    root: 999,
};

interface NavigationNodeWithMetadataAndParents {
    node: NavigationNodeWithMetadata;
    parents: NavigationNode[];
    next: NavigationNodeNeighbor | undefined;
    prev: NavigationNodeNeighbor | undefined;
}

export class NodeCollector {
    private idToNode = new Map<FernNavigation.NodeId, NavigationNodeWithMetadata>();
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
            if (node.type === "sidebarRoot") {
                this.#last = undefined;
                this.#lastNeighboringNode = undefined;
            }

            if (!hasMetadata(node)) {
                return;
            }
            this.idToNode.set(node.id, node);
            const existing = this.slugToNode[node.slug];
            if (existing == null) {
                this.#setNode(node.slug, node, parents);
            } else if (PRIORITY_LIST[node.type] < PRIORITY_LIST[existing.node.type] && !node.hidden) {
                this.#setNode(node.slug, node, parents);
                this.orphanedNodes.push(existing.node);
            } else if (PRIORITY_LIST[node.type] === PRIORITY_LIST[existing.node.type]) {
                if (
                    (!node.hidden && existing.node.hidden) ||
                    parents.indexOf(existing.node) > -1 ||
                    !isPage(existing.node)
                ) {
                    this.#setNode(node.slug, node, parents);
                    this.orphanedNodes.push(existing.node);
                } else {
                    if (!node.hidden) {
                        // eslint-disable-next-line no-console
                        console.warn(`Duplicate slug found: ${node.slug}`);
                    }
                    this.orphanedNodes.push(node);
                }
            } else if (PRIORITY_LIST[node.type] > PRIORITY_LIST[existing.node.type]) {
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

    public get(id: FernNavigation.NodeId): NavigationNodeWithMetadata | undefined {
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
        return Object.values(this.slugToNode)
            .filter(({ node }) => node.type === "version")
            .map(({ node }) => node as FernNavigation.VersionNode);
    });
}
