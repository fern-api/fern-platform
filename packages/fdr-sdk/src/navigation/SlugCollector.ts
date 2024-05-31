import { once } from "lodash-es";
import urljoin from "url-join";
import { FernNavigation } from "./generated";
import { NavigationNodeWithMetadata } from "./types/NavigationNode";
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

export class SlugCollector {
    private slugToNode: Record<string, NavigationNodeWithMetadata> = {};
    private orphanedNodes: NavigationNodeWithMetadata[] = [];
    constructor(rootNode: FernNavigation.RootNode) {
        traverseNavigation(rootNode, (node) => {
            if (!nodeHasMetadata(node)) {
                return;
            }
            const slug = urljoin(node.slug);
            const existingNode = this.slugToNode[slug];
            if (existingNode == null) {
                this.slugToNode[slug] = node;
            } else if (PRIORITY_LIST[node.type] < PRIORITY_LIST[existingNode.type] && !node.hidden) {
                this.slugToNode[slug] = node;
                this.orphanedNodes.push(existingNode);
            } else if (PRIORITY_LIST[node.type] === PRIORITY_LIST[existingNode.type]) {
                if (!node.hidden && existingNode.hidden) {
                    this.slugToNode[slug] = node;
                    this.orphanedNodes.push(existingNode);
                } else {
                    // eslint-disable-next-line no-console
                    console.warn(`Duplicate slug found: ${slug}`);
                    this.orphanedNodes.push(node);
                }
            } else if (PRIORITY_LIST[node.type] > PRIORITY_LIST[existingNode.type]) {
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

    public getSlugMap = once((): Map<string, NavigationNodeWithMetadata> => {
        return new Map(Object.entries(this.slugToNode));
    });

    public getSlugs = once((): string[] => {
        return Object.keys(this.slugToNode);
    });

    public getSlugsWithContent = once((): string[] => {
        return Object.values(this.slugToNode)
            .filter(nodeHasContent)
            .map((node) => urljoin(node.slug));
    });
}
