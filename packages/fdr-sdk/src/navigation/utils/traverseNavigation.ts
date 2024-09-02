import { noop } from "ts-essentials";
import { visitDiscriminatedUnion } from "../../utils";
import { NavigationNode } from "../types/NavigationNode";

const SKIP = "skip" as const;
// const CONTINUE = true as const;
const STOP = false as const;

export function traverseNavigation(
    node: NavigationNode,
    visit: (node: NavigationNode, index: number | undefined, parents: NavigationNode[]) => boolean | typeof SKIP | void,
): void {
    function internalChildrenTraverser(nodes: NavigationNode[], parents: NavigationNode[]): boolean | void {
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
        parents: NavigationNode[],
    ): boolean | void {
        const v = visit(node, index, parents);
        if (v === SKIP) {
            return;
        } else if (v === STOP) {
            return STOP;
        }
        return visitDiscriminatedUnion(node)._visit({
            root: (root) => internalTraverser(root.child, undefined, [...parents, root]),
            product: () => undefined,
            productgroup: () => undefined,
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
