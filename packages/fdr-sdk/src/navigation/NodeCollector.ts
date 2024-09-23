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

export class ApiReferenceNodeCollector {
    private endpointIdToNode = new Map<FernNavigation.EndpointId, FernNavigation.EndpointNode>();
    private webSocketIdToNode = new Map<FernNavigation.WebSocketId, FernNavigation.WebSocketNode>();
    private webhookIdToNode = new Map<FernNavigation.WebhookId, FernNavigation.WebhookNode>();

    public static collect(rootNode: FernNavigation.ApiReferenceNode): ApiReferenceNodeCollector {
        return new ApiReferenceNodeCollector(rootNode);
    }

    private constructor(private internalRootNode: FernNavigation.ApiReferenceNode) {
        traverseNavigation(internalRootNode, (node) => {
            if (node.type === "endpoint") {
                this.endpointIdToNode.set(node.endpointId, node);
            } else if (node.type === "webSocket") {
                this.webSocketIdToNode.set(node.webSocketId, node);
            } else if (node.type === "webhook") {
                this.webhookIdToNode.set(node.webhookId, node);
            }
        });
    }

    get rootNode() {
        return this.internalRootNode;
    }

    public getEndpointNode(endpointId: FernNavigation.EndpointId): FernNavigation.EndpointNode | undefined {
        return this.endpointIdToNode.get(endpointId);
    }

    public getWebSocketNode(webSocketId: FernNavigation.WebSocketId): FernNavigation.WebSocketNode | undefined {
        return this.webSocketIdToNode.get(webSocketId);
    }

    public getWebhookNode(webhookId: FernNavigation.WebhookId): FernNavigation.WebhookNode | undefined {
        return this.webhookIdToNode.get(webhookId);
    }
}

export class NodeCollector {
    private static readonly EMPTY = new NodeCollector(undefined);
    private idToNode = new Map<FernNavigation.NodeId, NavigationNode>();
    private idToNodeParents = new Map<FernNavigation.NodeId, NavigationNode[]>();
    private slugToNode = new Map<FernNavigation.Slug, NavigationNodeWithMetadataAndParents>();
    private orphanedNodes: NavigationNodeWithMetadata[] = [];
    private _apis = new Map<FernNavigation.ApiDefinitionId, ApiReferenceNodeCollector>();

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
    private versionNodes: FernNavigation.VersionNode[] = [];
    constructor(rootNode: NavigationNode | undefined) {
        if (rootNode == null) {
            return;
        }
        traverseNavigation(rootNode, (node, _index, parents) => {
            // if the node is the default version, make a copy of it and "prune" the version slug from all children nodes
            const parent = parents[parents.length - 1];

            if (node.type === "version") {
                this.versionNodes.push(node);
            }

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
                    this.visitNode(node, [...parents, ...innerParents], true);
                });
            }

            this.visitNode(node, parents);
        });
    }

    private visitNode(node: NavigationNode, parents: NavigationNode[], isDefaultVersion = false): void {
        if (!this.idToNode.has(node.id) || isDefaultVersion) {
            this.idToNode.set(node.id, node);
            this.idToNodeParents.set(node.id, parents);
        }

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

        if (node.type === "apiReference") {
            this._apis.set(node.apiDefinitionId, ApiReferenceNodeCollector.collect(node));
        }
    }

    public getOrphanedNodes(): NavigationNodeWithMetadata[] {
        return this.orphanedNodes;
    }

    public getOrphanedPages = once((): NavigationNodeWithMetadata[] => {
        return this.orphanedNodes.filter(isPage);
    });

    private getSlugMap = once((): Map<string, NavigationNodeWithMetadata> => {
        return new Map([...this.slugToNode.entries()].map(([slug, { node }]) => [slug, node]));
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

    public getSlugMapWithParents = (): ReadonlyMap<FernNavigation.Slug, NavigationNodeWithMetadataAndParents> => {
        return this.slugToNode;
    };

    public getSlugs = once((): string[] => {
        return [...this.slugToNode.keys()];
    });

    /**
     * Returns a list of slugs for all pages in the navigation tree. This includes hidden pages.
     */
    public getPageSlugs = once((): string[] => {
        return [...this.slugToNode.values()].filter(({ node }) => isPage(node)).map(({ node }) => urljoin(node.slug));
    });

    /**
     * Returns a list of slugs for pages that should be indexed by search engines, and by algolia.
     *
     * This excludes hidden pages and noindex pages.
     */
    public getIndexablePageSlugs = once((): string[] => {
        return [...this.slugToNode.values()]
            .filter(({ node }) => isPage(node) && node.hidden !== true)
            .filter(({ node }) => (hasMarkdown(node) ? node.noindex !== true : true))
            .map(({ node }) => urljoin(node.slug));
    });

    public getVersionNodes = (): FernNavigation.VersionNode[] => {
        return this.versionNodes;
    };

    get apis(): ReadonlyMap<FernNavigation.ApiDefinitionId, ApiReferenceNodeCollector> {
        return this._apis;
    }
}
