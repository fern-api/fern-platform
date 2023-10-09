import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "../fern";
import { joinUrlSlugs } from "../slug";
import { NODE_FACTORY } from "./node-factory";
import type {
    ChildDefinitionNode,
    DefinitionNode,
    DefinitionNodeTab,
    DefinitionNodeVersion,
    ItemSlug,
    ParentDefinitionNode,
} from "./types";

interface BuildContext {
    definition: FernRegistryDocsRead.DocsDefinition;
    version: DefinitionNodeVersion | null;
    tab: DefinitionNodeTab | null;
}

export function buildDefinitionTree(definition: FernRegistryDocsRead.DocsDefinition): DefinitionNode.Root {
    const root = NODE_FACTORY.root.create();

    const navigationConfig = definition.config.navigation;

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
            if (versionIndex === 0) {
                root.info = {
                    type: "versioned",
                    defaultVersionNode: versionNode,
                };
            }
            addNodeChild(root, versionNode);
            if (isUnversionedTabbedNavigationConfig(version.config)) {
                const tabNodes = version.config.tabs.map((tab, tabIndex) => {
                    return buildNodeForNavigationTab(tab, [], {
                        definition,
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
                const children = buildNodesForNavigationItems(version.config.items, [], {
                    definition,
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

        return root;
    }

    if (isUnversionedTabbedNavigationConfig(navigationConfig)) {
        const tabNodes = navigationConfig.tabs.map((tab, tabIndex) => {
            return buildNodeForNavigationTab(tab, [], {
                definition,
                version: null,
                tab: { slug: tab.urlSlug, index: tabIndex },
            });
        });
        addNodeChildren(root, tabNodes);
    } else {
        const children = buildNodesForNavigationItems(navigationConfig.items, [], {
            definition,
            version: null,
            tab: null,
        });
        addNodeChildren(root, children);
    }

    return root;
}

function buildNodeForNavigationTab(
    tab: FernRegistryDocsRead.NavigationTab,
    parentSlugs: string[],
    context: BuildContext
): ChildDefinitionNode {
    const { version } = context;
    const node = NODE_FACTORY.tab.create({
        slug: tab.urlSlug,
        version,
    });
    const children = buildNodesForNavigationItems(tab.items, [...parentSlugs, tab.urlSlug], context);
    addNodeChildren(node, children);
    return node;
}

function buildNodesForNavigationItems(
    items: FernRegistryDocsRead.NavigationItem[],
    parentSlugs: string[],
    context: BuildContext
): ChildDefinitionNode[] {
    return items.map((childItem) =>
        buildNodeForNavigationItem(childItem, [...parentSlugs], context)
    ) as ChildDefinitionNode[];
}

function buildNodeForNavigationItem(
    item: FernRegistryDocsRead.NavigationItem,
    parentSlugs: string[],
    context: BuildContext
): DefinitionNode {
    const { version, tab } = context;
    switch (item.type) {
        case "page": {
            const page = item;
            return NODE_FACTORY.page.create({
                slug: page.urlSlug,
                leadingSlug: joinUrlSlugs(...parentSlugs, page.urlSlug),
                version,
                tab,
                page,
            });
        }
        case "section": {
            const docsSection = item;
            return buildNodeForDocsSection(docsSection, [...parentSlugs], context);
        }
        case "api": {
            const apiSection = item;
            return buildNodeForApiSection(apiSection, [...parentSlugs], context);
        }
    }
}

function buildNodeForDocsSection(
    section: FernRegistryDocsRead.DocsSection,
    parentSlugs: string[],
    context: BuildContext
): DefinitionNode.DocsSection {
    const { version, tab } = context;
    const node = NODE_FACTORY.docsSection.create({
        section,
        slug: section.urlSlug,
        version,
        tab,
    });
    const children = buildNodesForNavigationItems(section.items, nextSectionParentSlugs(section, parentSlugs), context);
    addNodeChildren(node, children);
    return node;
}

function buildNodeForApiSection(
    section: FernRegistryDocsRead.ApiSection,
    parentSlugs: string[],
    context: BuildContext
): DefinitionNode {
    const { definition, version, tab } = context;
    const node = NODE_FACTORY.apiSection.create({
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
        const endpointNode = buildNodeForEndpoint(endpoint, nextSectionParentSlugs(section, parentSlugs), context);
        addNodeChild(node, endpointNode);
    });
    apiDefinition.rootPackage.webhooks.forEach((webhook) => {
        const webhookNode = buildNodeForWebhook(webhook, nextSectionParentSlugs(section, parentSlugs), context);
        addNodeChild(node, webhookNode);
    });
    apiDefinition.rootPackage.subpackages.forEach((subpackageId) => {
        const subpackage = apiDefinition.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage '${subpackageId}' was not found.`);
        }
        const subpackageNode = buildNodeForSubpackage(
            subpackage,
            section,
            apiDefinition,
            nextSectionParentSlugs(section, parentSlugs),
            context
        );
        addNodeChild(node, subpackageNode);
    });
    return node;
}

function buildNodeForEndpoint(
    endpoint: FernRegistryApiRead.EndpointDefinition,
    parentSlugs: ItemSlug[],
    context: BuildContext
): DefinitionNode.Endpoint {
    const { version, tab } = context;
    const node = NODE_FACTORY.endpoint.create({
        endpoint,
        slug: endpoint.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, endpoint.urlSlug),
        version,
        tab,
    });
    return node;
}

function buildNodeForWebhook(
    webhook: FernRegistryApiRead.WebhookDefinition,
    parentSlugs: ItemSlug[],
    context: BuildContext
): DefinitionNode.Webhook {
    const { version, tab } = context;
    const node = NODE_FACTORY.webhook.create({
        webhook,
        slug: webhook.urlSlug,
        leadingSlug: joinUrlSlugs(...parentSlugs, webhook.urlSlug),
        version,
        tab,
    });
    return node;
}

function buildNodeForSubpackage(
    subpackage: FernRegistryApiRead.ApiDefinitionSubpackage,
    section: FernRegistryDocsRead.ApiSection,
    apiDefinition: FernRegistryApiRead.ApiDefinition,
    parentSlugs: ItemSlug[],
    context: BuildContext
): DefinitionNode.ApiSubpackage {
    const { version, tab } = context;
    const node = NODE_FACTORY.apiSubpackage.create({
        section,
        subpackage,
        slug: subpackage.urlSlug,
        version,
        tab,
    });
    subpackage.endpoints.forEach((endpoint) => {
        const endpointNode = buildNodeForEndpoint(endpoint, [...parentSlugs, subpackage.urlSlug], context);
        addNodeChild(node, endpointNode);
    });
    subpackage.webhooks.forEach((webhook) => {
        const webhookNode = buildNodeForWebhook(webhook, [...parentSlugs, subpackage.urlSlug], context);
        addNodeChild(node, webhookNode);
    });
    subpackage.subpackages.forEach((subpackageId) => {
        const childSubpackage = apiDefinition.subpackages[subpackageId];
        if (childSubpackage == null) {
            throw new Error(`Subpackage '${subpackageId}' was not found.`);
        }
        const subpackageNode = buildNodeForSubpackage(
            childSubpackage,
            section,
            apiDefinition,
            [...parentSlugs, subpackage.urlSlug],
            context
        );
        addNodeChild(node, subpackageNode);
    });
    return node;
}

function nextSectionParentSlugs(
    section: FernRegistryDocsRead.ApiSection | FernRegistryDocsRead.DocsSection,
    parentSlugs: string[]
) {
    return section.skipUrlSlug ? [...parentSlugs] : [...parentSlugs, section.urlSlug];
}

function addNodeChildren(parent: ParentDefinitionNode, children: ChildDefinitionNode[]) {
    children.forEach((child) => {
        addNodeChild(parent, child);
    });
}

function addNodeChild(parent: ParentDefinitionNode, child: ChildDefinitionNode) {
    parent.children.set(child.slug, child);
    parent.childrenOrdering.push(child.slug);
}
