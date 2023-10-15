import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../fern";
import { joinUrlSlugs } from "../slug";
import { NodeFactory } from "./node-factory";
import type { ChildDocsNode, DocsNode, DocsNodeTab, DocsNodeVersion, ItemSlug, ParentDocsNode } from "./types";

interface BuildContext {
    definition: FernRegistryDocsRead.DocsDefinition;
    version: DocsNodeVersion | null;
    tab: DocsNodeTab | null;
}

export function buildDefinitionTree(definition: FernRegistryDocsRead.DocsDefinition): DocsNode.Root {
    const root = NodeFactory.createRoot();

    const navigationConfig = definition.config.navigation;

    if (isVersionedNavigationConfig(navigationConfig)) {
        navigationConfig.versions.forEach((version, versionIndex) => {
            const versionNode = NodeFactory.createVersion({
                slug: version.urlSlug,
                version: {
                    id: version.version,
                    slug: version.urlSlug,
                    index: versionIndex,
                },
            });
            if (versionIndex === 0) {
                root.info = {
                    type: "versioned",
                    defaultVersionNode: versionNode,
                };
            }
            addNodeChild(root, versionNode);
            if (isUnversionedTabbedNavigationConfig(version.config)) {
                const tabNodes = version.config.tabs.map((tab, tabIndex) => {
                    return buildNodeForNavigationTab({
                        tab,
                        parentSlugs: [],
                        context: {
                            definition,
                            version: {
                                id: version.version,
                                slug: version.urlSlug,
                                index: versionIndex,
                            },
                            tab: {
                                slug: tab.urlSlug,
                                index: tabIndex,
                            },
                        },
                    });
                });
                addNodeChildren(versionNode, tabNodes);
            } else {
                const children = buildNodesForNavigationItems({
                    items: version.config.items,
                    parentSlugs: [],
                    context: {
                        definition,
                        version: {
                            id: version.version,
                            slug: version.urlSlug,
                            index: versionIndex,
                        },
                        tab: null,
                    },
                });
                addNodeChildren(versionNode, children);
            }
        });

        return root;
    }

    if (isUnversionedTabbedNavigationConfig(navigationConfig)) {
        const tabNodes = navigationConfig.tabs.map((tab, tabIndex) => {
            return buildNodeForNavigationTab({
                tab,
                parentSlugs: [],
                context: {
                    definition,
                    version: null,
                    tab: {
                        slug: tab.urlSlug,
                        index: tabIndex,
                    },
                },
            });
        });
        addNodeChildren(root, tabNodes);
    } else {
        const children = buildNodesForNavigationItems({
            items: navigationConfig.items,
            parentSlugs: [],
            context: {
                definition,
                version: null,
                tab: null,
            },
        });
        addNodeChildren(root, children);
    }

    return root;
}

function buildNodeForNavigationTab({
    tab,
    parentSlugs,
    context,
}: {
    tab: FernRegistryDocsRead.NavigationTab;
    parentSlugs: string[];
    context: BuildContext;
}): ChildDocsNode {
    const { version } = context;
    const tabNode = NodeFactory.createTab({
        slug: tab.urlSlug,
        version,
    });
    const children = buildNodesForNavigationItems({
        items: tab.items,
        parentSlugs: [...parentSlugs, tab.urlSlug],
        context,
    });
    addNodeChildren(tabNode, children);
    return tabNode;
}

function buildNodesForNavigationItems({
    items,
    parentSlugs,
    context,
}: {
    items: FernRegistryDocsRead.NavigationItem[];
    parentSlugs: string[];
    context: BuildContext;
}): ChildDocsNode[] {
    return items.map((childItem) =>
        buildNodeForNavigationItem({
            item: childItem,
            parentSlugs: [...parentSlugs],
            context,
        })
    ) as ChildDocsNode[];
}

function buildNodeForNavigationItem({
    item,
    parentSlugs,
    context,
}: {
    item: FernRegistryDocsRead.NavigationItem;
    parentSlugs: string[];
    context: BuildContext;
}): DocsNode {
    const { version, tab } = context;
    switch (item.type) {
        case "page": {
            const page = item;
            return NodeFactory.createPage({
                slug: page.urlSlug,
                leadingSlug: joinUrlSlugs(...parentSlugs, page.urlSlug),
                version,
                tab,
                page,
            });
        }
        case "section": {
            const docsSection = item;
            return buildNodeForDocsSection({
                section: docsSection,
                parentSlugs: [...parentSlugs],
                context,
            });
        }
        case "api": {
            const apiSection = item;
            return buildNodeForApiSection({
                section: apiSection,
                parentSlugs: [...parentSlugs],
                context,
            });
        }
    }
}

function buildNodeForDocsSection({
    section,
    parentSlugs,
    context,
}: {
    section: FernRegistryDocsRead.DocsSection;
    parentSlugs: string[];
    context: BuildContext;
}): DocsNode.DocsSection {
    const { version, tab } = context;
    const sectionNode = NodeFactory.createDocsSection({
        section,
        slug: section.urlSlug,
        version,
        tab,
    });
    const children = buildNodesForNavigationItems({
        items: section.items,
        parentSlugs: nextSectionParentSlugs(section, parentSlugs),
        context,
    });
    addNodeChildren(sectionNode, children);
    return sectionNode;
}

function buildNodeForApiSection({
    section,
    parentSlugs,
    context,
}: {
    section: FernRegistryDocsRead.ApiSection;
    parentSlugs: string[];
    context: BuildContext;
}): DocsNode {
    const { definition, version, tab } = context;
    const sectionNode = NodeFactory.createApiSection({
        section,
        slug: section.urlSlug,
        version,
        tab,
    });
    const apiDefinitionId = section.api;
    const apiDefinition = definition.apis[apiDefinitionId];
    if (apiDefinition == null) {
        throw new Error(`API definition '${apiDefinitionId}' was not found.`);
    }
    apiDefinition.rootPackage.endpoints.forEach((endpoint) => {
        const endpointNode = buildNodeForEndpoint({
            endpoint,
            parentSlugs: nextSectionParentSlugs(section, parentSlugs),
            context,
        });
        addNodeChild(sectionNode, endpointNode);
    });
    apiDefinition.rootPackage.webhooks.forEach((webhook) => {
        const webhookNode = buildNodeForWebhook({
            webhook,
            parentSlugs: nextSectionParentSlugs(section, parentSlugs),
            context,
        });
        addNodeChild(sectionNode, webhookNode);
    });
    apiDefinition.rootPackage.subpackages.forEach((subpackageId) => {
        const subpackage = apiDefinition.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage '${subpackageId}' was not found.`);
        }
        const subpackageNode = buildNodeForSubpackage({
            subpackage,
            section,
            apiDefinition,
            parentSlugs: nextSectionParentSlugs(section, parentSlugs),
            context,
        });
        addNodeChild(sectionNode, subpackageNode);
    });
    return sectionNode;
}

function buildNodeForEndpoint({
    endpoint,
    parentSlugs,
    context,
}: {
    endpoint: FernRegistryApiRead.EndpointDefinition;
    parentSlugs: ItemSlug[];
    context: BuildContext;
}): DocsNode.Endpoint {
    const { version, tab } = context;
    const endpointNode = NodeFactory.createEndpoint({
        endpoint,
        slug: endpoint.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, endpoint.urlSlug),
        version,
        tab,
    });
    return endpointNode;
}

function buildNodeForWebhook({
    webhook,
    parentSlugs,
    context,
}: {
    webhook: FernRegistryApiRead.WebhookDefinition;
    parentSlugs: ItemSlug[];
    context: BuildContext;
}): DocsNode.Webhook {
    const { version, tab } = context;
    const webhookNode = NodeFactory.createWebhook({
        webhook,
        slug: webhook.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, webhook.urlSlug),
        version,
        tab,
    });
    return webhookNode;
}

function buildNodeForSubpackage({
    subpackage,
    section,
    apiDefinition,
    parentSlugs,
    context,
}: {
    subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    section: FernRegistryDocsRead.ApiSection;
    apiDefinition: FernRegistryApiRead.ApiDefinition;
    parentSlugs: ItemSlug[];
    context: BuildContext;
}): DocsNode.ApiSubpackage {
    const { version, tab } = context;
    const subpackageNode = NodeFactory.createApiSubpackage({
        section,
        subpackage,
        slug: subpackage.urlSlug,
        version,
        tab,
    });
    subpackage.endpoints.forEach((endpoint) => {
        const endpointNode = buildNodeForEndpoint({
            endpoint,
            parentSlugs: [...parentSlugs, subpackage.urlSlug],
            context,
        });
        addNodeChild(subpackageNode, endpointNode);
    });
    subpackage.webhooks.forEach((webhook) => {
        const webhookNode = buildNodeForWebhook({
            webhook,
            parentSlugs: [...parentSlugs, subpackage.urlSlug],
            context,
        });
        addNodeChild(subpackageNode, webhookNode);
    });
    subpackage.subpackages.forEach((subpackageId) => {
        const childSubpackage = apiDefinition.subpackages[subpackageId];
        if (childSubpackage == null) {
            throw new Error(`Subpackage '${subpackageId}' was not found.`);
        }
        const childSubpackageNode = buildNodeForSubpackage({
            subpackage: childSubpackage,
            section,
            apiDefinition,
            parentSlugs: [...parentSlugs, subpackage.urlSlug],
            context,
        });
        addNodeChild(subpackageNode, childSubpackageNode);
    });
    return subpackageNode;
}

function nextSectionParentSlugs(
    section: FernRegistryDocsRead.ApiSection | FernRegistryDocsRead.DocsSection,
    parentSlugs: string[]
) {
    return section.skipUrlSlug ? [...parentSlugs] : [...parentSlugs, section.urlSlug];
}

function addNodeChildren(parent: ParentDocsNode, children: ChildDocsNode[]) {
    children.forEach((child) => {
        addNodeChild(parent, child);
    });
}

function addNodeChild(parent: ParentDocsNode, child: ChildDocsNode) {
    parent.children.set(child.slug, child);
    parent.childrenOrdering.push(child.slug);
}
