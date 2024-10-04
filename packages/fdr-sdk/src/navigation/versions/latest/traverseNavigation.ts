import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { noop } from "ts-essentials";
import { NavigationNode } from "./NavigationNode";
import { isLeaf } from "./NavigationNodeLeaf";
import { NavigationNodeWithChildren } from "./NavigationNodeWithChildren";

const SKIP = "skip" as const;
const STOP = false as const;

/**
 * Traverse the navigation tree in a depth-first manner (pre-order).
 */
export function traverseNavigation(
    node: NavigationNode,
    visit: (
        node: NavigationNode,
        index: number | undefined,
        parents: NavigationNodeWithChildren[],
    ) => boolean | typeof SKIP | void,
): void {
    function internalChildrenTraverser(nodes: NavigationNode[], parents: NavigationNodeWithChildren[]): boolean | void {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node == null) {
                throw new Error(`Failed to index into nodes. Index: ${i} Length: ${nodes.length}`);
            }
            const result = internalTraverser(node, i, parents);
            if (result === STOP) {
                return STOP;
            }
        }
        return;
    }
    function internalTraverser(
        node: NavigationNode,
        index: number | undefined,
        parents: NavigationNodeWithChildren[],
    ): boolean | void {
        const v = visit(node, index, parents);
        if (v === SKIP) {
            return;
        } else if (v === STOP) {
            return STOP;
        }
        return visitDiscriminatedUnion(node)._visit({
            root: (root) => internalTraverser(root.child, undefined, [...parents, root]),
            product: (product) => internalTraverser(product.child, undefined, [...parents, product]),
            productgroup: (productgroup) => {
                if (productgroup.landingPage != null) {
                    const result = internalTraverser(productgroup.landingPage, undefined, [...parents, productgroup]);
                    if (result === STOP) {
                        return STOP;
                    }
                }
                return internalChildrenTraverser(productgroup.children, [...parents, productgroup]);
            },
            versioned: (versioned) => internalChildrenTraverser(versioned.children, [...parents, versioned]),
            tabbed: (tabbed) => internalChildrenTraverser(tabbed.children, [...parents, tabbed]),
            sidebarRoot: (sidebar) => internalChildrenTraverser(sidebar.children, [...parents, sidebar]),
            sidebarGroup: (sidebarGroup) =>
                internalChildrenTraverser(sidebarGroup.children, [...parents, sidebarGroup]),
            version: (version) => {
                if (version.landingPage != null) {
                    const result = internalTraverser(version.landingPage, undefined, [...parents, version]);
                    if (result === STOP) {
                        return STOP;
                    }
                }
                return internalTraverser(version.child, undefined, [...parents, version]);
            },
            tab: (tab) => internalTraverser(tab.child, undefined, [...parents, tab]),
            link: noop,
            page: noop,
            landingPage: noop,
            section: (section) => internalChildrenTraverser(section.children, [...parents, section]),
            apiReference: (apiReference) => {
                const result = internalChildrenTraverser(apiReference.children, [...parents, apiReference]);
                if (result === STOP) {
                    return STOP;
                }
                if (apiReference.changelog != null) {
                    return internalTraverser(apiReference.changelog, undefined, [...parents, apiReference]);
                }
            },
            changelog: (changelog) => internalChildrenTraverser(changelog.children, [...parents, changelog]),
            changelogYear: (changelogYear) =>
                internalChildrenTraverser(changelogYear.children, [...parents, changelogYear]),
            changelogMonth: (changelogMonth) =>
                internalChildrenTraverser(changelogMonth.children, [...parents, changelogMonth]),
            changelogEntry: noop,
            endpoint: noop,
            webSocket: noop,
            webhook: noop,
            apiPackage: (apiPackage) => internalChildrenTraverser(apiPackage.children, [...parents, apiPackage]),
            endpointPair: (endpointPair) => {
                const result = internalTraverser(endpointPair.nonStream, undefined, [...parents, endpointPair]);
                if (result === STOP) {
                    return STOP;
                }
                return internalTraverser(endpointPair.stream, undefined, [...parents, endpointPair]);
            },
            unversioned: (unversioned) => {
                if (unversioned.landingPage != null) {
                    const result = internalTraverser(unversioned.landingPage, undefined, [...parents, unversioned]);
                    if (result === STOP) {
                        return STOP;
                    }
                }

                return internalTraverser(unversioned.child, undefined, [...parents, unversioned]);
            },
        });
    }
    internalTraverser(node, undefined, []);
}

export function traverseNavigationLevelOrder(
    node: NavigationNode,
    visit: (node: NavigationNode, parent: NavigationNodeWithChildren[]) => typeof SKIP | void,
) {
    const queue: [NavigationNode, NavigationNodeWithChildren[]][] = [[node, []]];
    while (queue.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [node, parents] = queue.shift()!;

        const result = visit(node, parents);
        if (result === SKIP) {
            continue;
        }

        if (isLeaf(node)) {
            continue;
        }

        visitDiscriminatedUnion(node)._visit<void>({
            root: (root) => queue.push([root.child, [...parents, root]]),
            product: (product) => queue.push([product.child, [...parents, product]]),
            productgroup: (productgroup) => {
                if (productgroup.landingPage) {
                    queue.push([productgroup.landingPage, [...parents, productgroup]]);
                }

                for (const child of productgroup.children) {
                    queue.push([child, [...parents, productgroup]]);
                }
            },
            versioned: (versioned) => {
                for (const child of versioned.children) {
                    queue.push([child, [...parents, versioned]]);
                }
            },
            tabbed: (tabbed) => {
                for (const child of tabbed.children) {
                    queue.push([child, [...parents, tabbed]]);
                }
            },
            sidebarRoot: (sidebar) => {
                for (const child of sidebar.children) {
                    queue.push([child, [...parents, sidebar]]);
                }
            },
            sidebarGroup: (sidebarGroup) => {
                for (const child of sidebarGroup.children) {
                    queue.push([child, [...parents, sidebarGroup]]);
                }
            },
            version: (version) => {
                if (version.landingPage != null) {
                    queue.push([version.landingPage, [...parents, version]]);
                }
                queue.push([version.child, [...parents, version]]);
            },
            tab: (tab) => {
                queue.push([tab.child, [...parents, tab]]);
            },
            section: (section) => {
                for (const child of section.children) {
                    queue.push([child, [...parents, section]]);
                }
            },
            apiReference: (apiReference) => {
                for (const child of apiReference.children) {
                    queue.push([child, [...parents, apiReference]]);
                }
                if (apiReference.changelog != null) {
                    queue.push([apiReference.changelog, [...parents, apiReference]]);
                }
            },
            changelog: (changelog) => {
                for (const child of changelog.children) {
                    queue.push([child, [...parents, changelog]]);
                }
            },
            changelogYear: (changelogYear) => {
                for (const child of changelogYear.children) {
                    queue.push([child, [...parents, changelogYear]]);
                }
            },
            changelogMonth: (changelogMonth) => {
                for (const child of changelogMonth.children) {
                    queue.push([child, [...parents, changelogMonth]]);
                }
            },
            apiPackage: (apiPackage) => {
                for (const child of apiPackage.children) {
                    queue.push([child, [...parents, apiPackage]]);
                }
            },
            endpointPair: (endpointPair) => {
                queue.push([endpointPair.nonStream, [...parents, endpointPair]]);
                queue.push([endpointPair.stream, [...parents, endpointPair]]);
            },
            unversioned: (unversioned) => {
                if (unversioned.landingPage != null) {
                    queue.push([unversioned.landingPage, [...parents, unversioned]]);
                }
                queue.push([unversioned.child, [...parents, unversioned]]);
            },
        });
    }
}
