import { once } from "lodash-es";
import urljoin from "url-join";
import { FernNavigation } from "./generated";
import { NavigationNode, NavigationNodeWithContent, NavigationNodeWithMetadata } from "./types/NavigationNode";
import { nodeHasContent } from "./utils/nodeHasContent";
import { nodeHasMetadata } from "./utils/nodeHasMetadata";
import { traverseNavigation } from "./visitors/traverseNavigation";

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
    apiReference: 4,
    tab: 5,
    version: 6,
    root: 999,
};

interface NavigationNodeWithMetadataAndParents {
    node: NavigationNodeWithMetadata;
    parents: NavigationNode[];
    next: NavigationNodeWithContent | undefined;
    prev: NavigationNodeWithContent | undefined;
}

export class SlugCollector {
    private slugToNode: Record<string, NavigationNodeWithMetadataAndParents> = {};
    private orphanedNodes: NavigationNodeWithMetadata[] = [];

    public static collect(rootNode: NavigationNode): SlugCollector {
        return new SlugCollector(rootNode);
    }

    #last: NavigationNodeWithMetadataAndParents | undefined;
    #lastNodeWithContent: NavigationNodeWithContent | undefined;
    #setNode(slug: string, node: NavigationNodeWithMetadata, parents: NavigationNode[]) {
        const toSet = { node, parents, prev: this.#lastNodeWithContent, next: undefined };
        this.slugToNode[slug] = toSet;

        if (nodeHasContent(node) && !node.hidden) {
            this.#lastNodeWithContent = node;
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
                this.#lastNodeWithContent = undefined;
            }

            if (!nodeHasMetadata(node)) {
                return;
            }
            const slug = urljoin(node.slug);
            const existing = this.slugToNode[slug];
            if (existing == null) {
                this.#setNode(slug, node, parents);
            } else if (PRIORITY_LIST[node.type] < PRIORITY_LIST[existing.node.type] && !node.hidden) {
                this.#setNode(slug, node, parents);
                this.orphanedNodes.push(existing.node);
            } else if (PRIORITY_LIST[node.type] === PRIORITY_LIST[existing.node.type]) {
                if (!node.hidden && existing.node.hidden) {
                    this.#setNode(slug, node, parents);
                    this.orphanedNodes.push(existing.node);
                } else {
                    if (!node.hidden) {
                        // eslint-disable-next-line no-console
                        console.warn(`Duplicate slug found: ${slug}`);
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

    public getOrphanedNodesWithContent = once((): NavigationNodeWithMetadata[] => {
        return this.orphanedNodes.filter(nodeHasContent);
    });

    private getSlugMap = once((): Map<string, NavigationNodeWithMetadata> => {
        return new Map(Object.entries(this.slugToNode).map(([slug, { node }]) => [slug, node]));
    });

    get slugMap(): Map<string, NavigationNodeWithMetadata> {
        return this.getSlugMap();
    }

    public getSlugMapWithParents = once((): Map<string, NavigationNodeWithMetadataAndParents> => {
        return new Map(Object.entries(this.slugToNode));
    });

    public getSlugs = once((): string[] => {
        return Object.keys(this.slugToNode);
    });

    public getSlugsWithContent = once((): string[] => {
        return Object.values(this.slugToNode)
            .filter(({ node }) => nodeHasContent(node))
            .map(({ node }) => urljoin(node.slug));
    });

    public getVersionNodes = once((): FernNavigation.VersionNode[] => {
        return Object.values(this.slugToNode)
            .filter(({ node }) => node.type === "version")
            .map(({ node }) => node as FernNavigation.VersionNode);
    });
}
