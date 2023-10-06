import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../fern";
import { NODE_FACTORY } from "./node-factory";
import type {
    DefinitionNode,
    DefinitionNodeTab,
    DefinitionNodeVersion,
    ResolvedChildNode,
    ResolvedParentNode,
} from "./types";

type TraversalContext = {
    version: DefinitionNodeVersion | null;
    tab: DefinitionNodeTab | null;
};

export function buildDefinitionTree(docsDefinition: FernRegistryDocsRead.DocsDefinition): DefinitionNode.Root {
    const root = NODE_FACTORY.root.create();
    const navigationConfig = docsDefinition.config.navigation;

    if (isVersionedNavigationConfig(navigationConfig)) {
        navigationConfig.versions.forEach((version, versionIndex) => {
            const versionNode = NODE_FACTORY.version.create({
                slug: version.urlSlug,
                version: {
                    id: version.version,
                    slug: version.urlSlug,
                    index: versionIndex,
                },
            });
            addNodeChild(root, versionNode);
            if (isUnversionedTabbedNavigationConfig(version.config)) {
                const tabNodes = version.config.tabs.map((tab, tabIndex) => {
                    return buildNodeForNavigationTab(tab, {
                        version: {
                            id: version.version,
                            slug: version.urlSlug,
                            index: versionIndex,
                        },
                        tab: { slug: tab.urlSlug, index: tabIndex },
                    });
                });
                addNodeChildren(versionNode, tabNodes);
            } else {
                const children = buildNodesForNavigationItems(version.config.items, {
                    version: {
                        id: version.version,
                        slug: version.urlSlug,
                        index: versionIndex,
                    },
                    tab: null,
                });
                addNodeChildren(versionNode, children);
            }
        });
    } else {
        if (isUnversionedTabbedNavigationConfig(navigationConfig)) {
            const tabNodes = navigationConfig.tabs.map((tab, tabIndex) => {
                return buildNodeForNavigationTab(tab, {
                    version: null,
                    tab: { slug: tab.urlSlug, index: tabIndex },
                });
            });
            addNodeChildren(root, tabNodes);
        } else {
            const children = buildNodesForNavigationItems(navigationConfig.items, {
                version: null,
                tab: null,
            });
            addNodeChildren(root, children);
        }
    }

    return root;
}

function addNodeChildren(parent: ResolvedParentNode, children: ResolvedChildNode[]) {
    children.forEach((child) => {
        addNodeChild(parent, child);
    });
}

function addNodeChild(parent: ResolvedParentNode, child: ResolvedChildNode) {
    parent.children.set(child.slug, child);
    parent.childrenOrdering.push(child.slug);
}

function buildNodeForNavigationTab(
    tab: FernRegistryDocsRead.NavigationTab,
    context: TraversalContext
): ResolvedChildNode {
    const { version } = context;
    const node = NODE_FACTORY.tab.create({
        slug: tab.urlSlug,
        version,
    });
    const children = buildNodesForNavigationItems(tab.items, context);
    addNodeChildren(node, children);
    return node;
}

function buildNodesForNavigationItems(
    items: FernRegistryDocsRead.NavigationItem[],
    context: TraversalContext
): ResolvedChildNode[] {
    return items.map((childItem) => buildNodeForNavigationItem(childItem, context)) as ResolvedChildNode[];
}

function buildNodeForNavigationItem(
    item: FernRegistryDocsRead.NavigationItem,
    context: TraversalContext
): DefinitionNode {
    const { version, tab } = context;
    switch (item.type) {
        case "page": {
            return NODE_FACTORY.page.create({
                slug: item.urlSlug,
                version,
                tab,
                page: item,
            });
        }
        case "api": {
            return NODE_FACTORY.apiSection.create({
                section: item,
                slug: item.urlSlug,
                version,
                tab,
            });
        }
        case "section": {
            const section = item;
            const node = NODE_FACTORY.docsSection.create({
                section,
                slug: section.urlSlug,
                version,
                tab,
            });
            const children = buildNodesForNavigationItems(section.items, context);
            addNodeChildren(node, children);
            return node;
        }
    }
}
