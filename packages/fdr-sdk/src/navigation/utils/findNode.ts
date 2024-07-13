import { visitDiscriminatedUnion } from "../../utils";

import { noop } from "ts-essentials";
import urljoin from "url-join";
import { NodeCollector } from "../NodeCollector";
import { FernNavigation } from "../generated";
import { NavigationNode, NavigationNodeNeighbor, NavigationNodePage, hasMetadata, isPage } from "../types";
import { hasRedirect } from "../types/NavigationNodeWithRedirect";

export type Node = Node.Found | Node.Redirect | Node.NotFound;

export declare namespace Node {
    interface Found {
        type: "found";
        node: NavigationNodePage;
        parents: NavigationNode[];
        breadcrumb: string[];
        root: FernNavigation.RootNode;
        versions: FernNavigation.VersionNode[];
        currentVersion: FernNavigation.VersionNode | undefined;
        currentTab: FernNavigation.TabNode | FernNavigation.ChangelogNode | undefined;
        tabs: FernNavigation.TabChild[];
        sidebar: FernNavigation.SidebarRootNode | undefined;
        apiReference: FernNavigation.ApiReferenceNode | undefined;
        next: NavigationNodeNeighbor | undefined;
        prev: NavigationNodeNeighbor | undefined;
        collector: NodeCollector;
        landingPage: FernNavigation.LandingPageNode | undefined;
    }

    interface Redirect {
        type: "redirect";
        redirect: FernNavigation.Slug;
    }

    interface NotFound {
        type: "notFound";
        redirect: FernNavigation.Slug | undefined;
    }
}

export function findNode(root: FernNavigation.RootNode, slug: string[]): Node {
    const slugToFind = urljoin(slug);
    const collector = NodeCollector.collect(root);
    const map = collector.getSlugMapWithParents();
    const found = map.get(slugToFind);
    if (found == null) {
        let maybeVersionNode: FernNavigation.RootNode | FernNavigation.VersionNode = root;
        for (const versionNode of collector.getVersionNodes()) {
            if (slugToFind.startsWith(versionNode.slug)) {
                maybeVersionNode = versionNode;
                break;
            }
        }

        return { type: "notFound", redirect: maybeVersionNode.pointsTo ?? root.pointsTo };
    }

    const sidebar = found.parents.find((node): node is FernNavigation.SidebarRootNode => node.type === "sidebarRoot");
    const currentVersion = found.parents.find((node): node is FernNavigation.VersionNode => node.type === "version");
    const tabbedNode = found.parents.find((node): node is FernNavigation.TabbedNode => node.type === "tabbed");
    const unversionedNode = found.parents.find(
        (node): node is FernNavigation.UnversionedNode => node.type === "unversioned",
    );
    const landingPage = (currentVersion ?? unversionedNode)?.landingPage;
    if (isPage(found.node)) {
        const parentsAndNode = [...found.parents, found.node];
        const tabbedNodeIndex = parentsAndNode.findIndex((node) => node === tabbedNode);
        const currentTab = tabbedNodeIndex !== -1 ? parentsAndNode[tabbedNodeIndex + 1] : undefined;
        return {
            type: "found",
            node: found.node,
            breadcrumb: createBreadcrumb(found.parents),
            parents: found.parents,
            root,
            // this is used to render the version switcher
            versions: collector.getVersionNodes().map((node) => {
                if (node.default) {
                    // if we're currently viewing the default version, we may be viewing the non-pruned version
                    if (node.id === currentVersion?.id) {
                        return currentVersion;
                    }
                    // otherwise, we should always use the pruned version node
                    return collector.defaultVersionNode ?? node;
                }
                return node;
            }),
            tabs: tabbedNode?.children ?? [],
            currentVersion,
            currentTab: currentTab?.type === "tab" || currentTab?.type === "changelog" ? currentTab : undefined,
            sidebar,
            apiReference:
                found.parents.find((node): node is FernNavigation.ApiReferenceNode => node.type === "apiReference") ??
                (found.node.type === "apiReference" ? found.node : undefined),
            landingPage,
            next: found.next,
            prev: found.prev,
            collector,
        };
    }

    // if the slug points matches the root node, redirect to the root node's pointsTo
    if (root.type === "root" && root.slug === slugToFind && root.pointsTo != null) {
        return { type: "redirect", redirect: root.pointsTo };
    }

    const redirect = hasRedirect(found.node) ? found.node.pointsTo : currentVersion?.pointsTo ?? root.pointsTo;

    if (redirect == null || redirect === slugToFind) {
        return { type: "notFound", redirect: undefined };
    }

    return { type: "redirect", redirect };
}

function createBreadcrumb(nodes: NavigationNode[]): string[] {
    const breadcrumb: string[] = [];
    nodes.forEach((node) => {
        if (!hasMetadata(node)) {
            return;
        }
        visitDiscriminatedUnion(node)._visit({
            root: noop,
            version: noop,
            tab: noop,
            page: noop,
            section: (section) => {
                breadcrumb.push(section.title);
            },
            apiReference: (apiReference) => {
                if (!apiReference.hideTitle) {
                    breadcrumb.push(apiReference.title);
                }
            },
            changelog: (changelog) => {
                breadcrumb.push(changelog.title);
            },
            changelogYear: (changelogYear) => {
                breadcrumb.push(changelogYear.title);
            },
            changelogMonth: (changelogMonth) => {
                breadcrumb.push(changelogMonth.title);
            },
            apiPackage: (apiPackage) => {
                breadcrumb.push(apiPackage.title);
            },
            changelogEntry: noop,
            endpoint: noop,
            webSocket: noop,
            webhook: noop,
            landingPage: noop,
        });
    });

    return breadcrumb;
}
