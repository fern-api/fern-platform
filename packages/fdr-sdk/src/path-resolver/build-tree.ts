import { APIV1Read, DocsV1Read, visitReadNavigationConfig, visitUnversionedReadNavigationConfig } from "../client";
import { NodeFactory } from "./node-factory";
import type {
    ChildDocsNode,
    DocsDefinitionSummary,
    DocsNode,
    ItemSlug,
    NodeDocsContext,
    ParentDocsNode,
} from "./types";
import { joinUrlSlugs } from "./util/slug";

type BuildContext =
    | {
          type: "versioned";
          root: DocsNode.Root;
          version: DocsNode.Version;
          navigationConfig: DocsV1Read.UnversionedTabbedNavigationConfig;
      }
    | {
          type: "unversioned";
          root: DocsNode.Root;
          version: null;
          navigationConfig: DocsV1Read.UnversionedTabbedNavigationConfig;
      };

export function buildDefinitionTree(definition: DocsDefinitionSummary): DocsNode.Root {
    const root = NodeFactory.createRoot(definition);

    const rootNavigationConfig = definition.docsConfig.navigation;

    visitReadNavigationConfig(rootNavigationConfig, {
        versioned: (config) => {
            config.versions.forEach((version, versionIndex) => {
                const versionNode = NodeFactory.createVersion({
                    slug: version.urlSlug,
                    info: {
                        id: version.version,
                        slug: version.urlSlug,
                        index: versionIndex,
                        availability: version.availability ?? null,
                    },
                    tabInfo: {
                        type: "untabbed",
                    },
                });
                if (versionIndex === 0) {
                    root.info = {
                        type: "versioned",
                        definition,
                        defaultVersionNode: versionNode,
                        versions: [],
                    };
                }
                if (root.info.type === "versioned") {
                    root.info.versions.push(versionNode);
                }
                addNodeChild(root, versionNode);
                const navigationConfig = version.config;

                visitUnversionedReadNavigationConfig(navigationConfig, {
                    tabbed: (tabbedConfig) => {
                        const tabNodes = tabbedConfig.tabs.map((tab, tabIndex) => {
                            return buildNodeForNavigationTab({
                                tab,
                                index: tabIndex,
                                parentSlugs: [],
                                context: {
                                    type: "versioned",
                                    root,
                                    version: versionNode,
                                    navigationConfig: tabbedConfig,
                                },
                            });
                        });
                        versionNode.tabInfo = {
                            type: "tabbed",
                            tabs: tabNodes,
                        };
                        addNodeChildren(versionNode, tabNodes);
                    },
                    untabbed: (untabbedConfig) => {
                        const children = buildNodesForNavigationItems({
                            items: untabbedConfig.items,
                            parentSlugs: [],
                            section: null,
                            context: {
                                type: "versioned-untabbed",
                                root,
                                navigationConfig: untabbedConfig,
                                version: versionNode,
                                tab: null,
                            },
                        });
                        addNodeChildren(versionNode, children);
                    },
                });
            });
        },
        unversioned: (config) => {
            visitUnversionedReadNavigationConfig(config, {
                tabbed: (tabbedConfig) => {
                    const tabNodes = tabbedConfig.tabs.map((tab, tabIndex) => {
                        return buildNodeForNavigationTab({
                            tab,
                            index: tabIndex,
                            parentSlugs: [],
                            context: {
                                type: "unversioned",
                                root,
                                version: null,
                                navigationConfig: tabbedConfig,
                            },
                        });
                    });
                    addNodeChildren(root, tabNodes);
                },
                untabbed: (untabbedConfig) => {
                    const children = buildNodesForNavigationItems({
                        items: untabbedConfig.items,
                        parentSlugs: [],
                        section: null,
                        context: {
                            type: "unversioned-untabbed",
                            root,
                            navigationConfig: untabbedConfig,
                            version: null,
                            tab: null,
                        },
                    });
                    addNodeChildren(root, children);
                },
            });
        },
    });

    return root;
}

function resolveSubpackage(
    apiDefinition: APIV1Read.ApiDefinition,
    subpackageId: APIV1Read.SubpackageId,
): APIV1Read.ApiDefinitionSubpackage {
    const subpackage = apiDefinition.subpackages[subpackageId];
    if (subpackage == null) {
        throw new Error("Subpackage does not exist");
    }
    if (subpackage.pointsTo != null) {
        const resolvedSubpackage = resolveSubpackage(apiDefinition, subpackage.pointsTo);
        return {
            ...resolvedSubpackage,
            name: subpackage.name,
            urlSlug: subpackage.urlSlug,
        };
    } else {
        return subpackage;
    }
}

function buildNodeForNavigationTab({
    tab,
    index,
    parentSlugs,
    context,
}: {
    tab: DocsV1Read.NavigationTab;
    index: number;
    parentSlugs: string[];
    context: BuildContext;
}): DocsNode.Tab {
    const tabNode = NodeFactory.createTab({
        slug: tab.urlSlug,
        version: context.version,
        index,
        items: tab.items,
    });
    const children = buildNodesForNavigationItems({
        items: tab.items,
        parentSlugs: [...parentSlugs, tab.urlSlug],
        section: null,
        context:
            context.type === "versioned"
                ? {
                      type: "versioned-tabbed",
                      root: context.root,
                      navigationConfig: context.navigationConfig,
                      version: context.version,
                      tab: tabNode,
                  }
                : {
                      type: "unversioned-tabbed",
                      root: context.root,
                      navigationConfig: context.navigationConfig,
                      version: null,
                      tab: tabNode,
                  },
    });
    addNodeChildren(tabNode, children);
    return tabNode;
}

function buildNodesForNavigationItems({
    items,
    parentSlugs,
    section,
    context,
}: {
    items: DocsV1Read.NavigationItem[];
    parentSlugs: string[];
    section: DocsV1Read.DocsSection | null;
    context: NodeDocsContext;
}): ChildDocsNode[] {
    return items.map((childItem) =>
        buildNodeForNavigationItem({
            item: childItem,
            parentSlugs: [...parentSlugs],
            section,
            context,
        }),
    ) as ChildDocsNode[];
}

function buildNodeForNavigationItem({
    item,
    parentSlugs,
    section,
    context,
}: {
    item: DocsV1Read.NavigationItem;
    parentSlugs: string[];
    section: DocsV1Read.DocsSection | null;
    context: NodeDocsContext;
}): DocsNode {
    switch (item.type) {
        case "page": {
            const page = item;
            return NodeFactory.createPage({
                slug: page.urlSlug,
                leadingSlug: joinUrlSlugs(...parentSlugs, page.urlSlug),
                page,
                section,
                context,
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
    section: DocsV1Read.DocsSection;
    parentSlugs: string[];
    context: NodeDocsContext;
}): DocsNode.DocsSection {
    const sectionNode = NodeFactory.createDocsSection({
        section,
        slug: section.urlSlug,
        context,
    });
    const children = buildNodesForNavigationItems({
        items: section.items,
        parentSlugs: nextSectionParentSlugs(section, parentSlugs),
        section,
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
    section: DocsV1Read.ApiSection;
    parentSlugs: string[];
    context: NodeDocsContext;
}): DocsNode {
    const { definition } = context.root.info;
    const sectionNode = NodeFactory.createApiSection({
        section,
        slug: section.urlSlug,
        context,
    });
    const apiDefinitionId = section.api;
    const apiDefinition = definition.apis[apiDefinitionId];
    if (apiDefinition == null) {
        throw new Error(`API definition '${apiDefinitionId}' was not found.`);
    }
    apiDefinition.rootPackage.endpoints.forEach((endpoint) => {
        const endpointNode = buildNodeForTopLevelEndpoint({
            endpoint,
            section,
            parentSlugs: nextSectionParentSlugs(section, parentSlugs),
            context,
        });
        addNodeChild(sectionNode, endpointNode);
    });
    apiDefinition.rootPackage.webhooks.forEach((webhook) => {
        const webhookNode = buildNodeForTopLevelWebhook({
            webhook,
            section,
            parentSlugs: nextSectionParentSlugs(section, parentSlugs),
            context,
        });
        addNodeChild(sectionNode, webhookNode);
    });
    apiDefinition.rootPackage.subpackages.forEach((subpackageId) => {
        const subpackage = resolveSubpackage(apiDefinition, subpackageId);
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

function buildNodeForTopLevelEndpoint({
    endpoint,
    section,
    parentSlugs,
    context,
}: {
    endpoint: APIV1Read.EndpointDefinition;
    section: DocsV1Read.ApiSection;
    parentSlugs: ItemSlug[];
    context: NodeDocsContext;
}): DocsNode.TopLevelEndpoint {
    const endpointNode = NodeFactory.createTopLevelEndpoint({
        endpoint,
        section,
        slug: endpoint.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, endpoint.urlSlug),
        context,
    });
    return endpointNode;
}

function buildNodeForEndpoint({
    endpoint,
    section,
    subpackage,
    parentSlugs,
    context,
}: {
    endpoint: APIV1Read.EndpointDefinition;
    section: DocsV1Read.ApiSection;
    subpackage: APIV1Read.ApiDefinitionSubpackage;
    parentSlugs: ItemSlug[];
    context: NodeDocsContext;
}): DocsNode.Endpoint {
    const endpointNode = NodeFactory.createEndpoint({
        endpoint,
        section,
        subpackage,
        slug: endpoint.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, endpoint.urlSlug),
        context,
    });
    return endpointNode;
}

function buildNodeForTopLevelWebhook({
    webhook,
    section,
    parentSlugs,
    context,
}: {
    webhook: APIV1Read.WebhookDefinition;
    section: DocsV1Read.ApiSection;
    parentSlugs: ItemSlug[];
    context: NodeDocsContext;
}): DocsNode.TopLevelWebhook {
    const webhookNode = NodeFactory.createTopLevelWebhook({
        webhook,
        section,
        slug: webhook.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, webhook.urlSlug),
        context,
    });
    return webhookNode;
}

function buildNodeForWebhook({
    webhook,
    section,
    subpackage,
    parentSlugs,
    context,
}: {
    webhook: APIV1Read.WebhookDefinition;
    section: DocsV1Read.ApiSection;
    subpackage: APIV1Read.ApiDefinitionSubpackage;
    parentSlugs: ItemSlug[];
    context: NodeDocsContext;
}): DocsNode.Webhook {
    const webhookNode = NodeFactory.createWebhook({
        webhook,
        section,
        subpackage,
        slug: webhook.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, webhook.urlSlug),
        context,
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
    subpackage: APIV1Read.ApiDefinitionSubpackage;
    section: DocsV1Read.ApiSection;
    apiDefinition: APIV1Read.ApiDefinition;
    parentSlugs: ItemSlug[];
    context: NodeDocsContext;
}): DocsNode.ApiSubpackage {
    const subpackageNode = NodeFactory.createApiSubpackage({
        section,
        subpackage,
        slug: subpackage.urlSlug,
        context,
    });
    subpackage.endpoints.forEach((endpoint) => {
        const endpointNode = buildNodeForEndpoint({
            endpoint,
            section,
            subpackage,
            parentSlugs: [...parentSlugs, subpackage.urlSlug],
            context,
        });
        addNodeChild(subpackageNode, endpointNode);
    });
    subpackage.webhooks.forEach((webhook) => {
        const webhookNode = buildNodeForWebhook({
            webhook,
            section,
            subpackage,
            parentSlugs: [...parentSlugs, subpackage.urlSlug],
            context,
        });
        addNodeChild(subpackageNode, webhookNode);
    });
    subpackage.subpackages.forEach((subpackageId) => {
        const childSubpackage = resolveSubpackage(apiDefinition, subpackageId);
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

function nextSectionParentSlugs(section: DocsV1Read.ApiSection | DocsV1Read.DocsSection, parentSlugs: string[]) {
    return section.skipUrlSlug ? [...parentSlugs] : [...parentSlugs, section.urlSlug];
}

function addNodeChildren(parent: ParentDocsNode, children: ChildDocsNode[]) {
    children.forEach((child) => {
        addNodeChild(parent, child);
    });
}

function addNodeChild(parent: ParentDocsNode, child: ChildDocsNode) {
    parent.children[child.slug] = child;
    parent.childrenOrdering.push(child.slug);
}
