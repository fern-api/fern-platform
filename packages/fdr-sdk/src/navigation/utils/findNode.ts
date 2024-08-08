import { noop } from "ts-essentials";
import { visitDiscriminatedUnion } from "../../utils";
import { NodeCollector } from "../NodeCollector";
import { FernNavigation } from "../generated";
import { NavigationNode, NavigationNodeNeighbor, NavigationNodePage, hasMetadata, isPage } from "../types";
import { hasRedirect } from "../types/NavigationNodeWithRedirect";
import { isApiReferenceNode } from "./isApiReferenceNode";
import { isSidebarRootNode } from "./isSidebarRootNode";
import { isTabbedNode } from "./isTabbedNode";
import { isUnversionedNode } from "./isUnversionedNode";
import { isVersionNode } from "./isVersionNode";

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

export function findNode(root: FernNavigation.RootNode, slug: FernNavigation.Slug): Node {
    const collector = NodeCollector.collect(root);
    const found = collector.getSlugMapWithParents().get(slug);

    // if the slug points to a node that doesn't exist, we should redirect to the first likely node
    if (found == null) {
        let maybeVersionNode: FernNavigation.RootNode | FernNavigation.VersionNode = root;

        // the 404 behavior should be version-aware
        for (const versionNode of collector.getVersionNodes()) {
            if (slug.startsWith(versionNode.slug)) {
                maybeVersionNode = versionNode;
                break;
            }
        }

        return { type: "notFound", redirect: maybeVersionNode.pointsTo ?? root.pointsTo };
    }

    const sidebar = found.parents.find(isSidebarRootNode);
    const currentVersion = found.parents.find(isVersionNode);
    const unversionedNode = found.parents.find(isUnversionedNode);
    const versionChild = (currentVersion ?? unversionedNode)?.child;
    const landingPage = (currentVersion ?? unversionedNode)?.landingPage;

    const tabbedNode =
        found.parents.find(isTabbedNode) ??
        // fallback to the version child because the current node may be a landing page
        (versionChild != null && isTabbedNode(versionChild) ? versionChild : undefined);

    const apiReference =
        found.parents.find(isApiReferenceNode) ?? (found.node.type === "apiReference" ? found.node : undefined);

    if (isPage(found.node)) {
        const parentsAndNode = [...found.parents, found.node];
        const tabbedNodeIndex = parentsAndNode.findIndex((node) => node === tabbedNode);
        const currentTabNode = tabbedNodeIndex !== -1 ? parentsAndNode[tabbedNodeIndex + 1] : undefined;
        const versions = collector.getVersionNodes().map((node) => {
            if (node.default) {
                // if we're currently viewing the default version, we may be viewing the non-pruned version
                if (node.id === currentVersion?.id) {
                    return currentVersion;
                }
                // otherwise, we should always use the pruned version node
                return collector.defaultVersionNode ?? node;
            }
            return node;
        });
        const currentTab =
            currentTabNode?.type === "tab" || currentTabNode?.type === "changelog" ? currentTabNode : undefined;
        return {
            type: "found",
            node: found.node,
            breadcrumb: createBreadcrumb(found.parents),
            parents: found.parents,
            root,
            versions, // this is used to render the version switcher
            tabs: tabbedNode?.children ?? [],
            currentVersion,
            currentTab,
            sidebar,
            apiReference,
            landingPage,
            next: found.next,
            prev: found.prev,
            collector,
        };
    }

    // if the slug points matches the root node, redirect to the root node's pointsTo
    if (root.type === "root" && root.slug === slug && root.pointsTo != null) {
        return { type: "redirect", redirect: root.pointsTo };
    }

    const redirect = hasRedirect(found.node) ? found.node.pointsTo : currentVersion?.pointsTo ?? root.pointsTo;

    if (redirect == null || redirect === slug) {
        return { type: "notFound", redirect: undefined };
    }

    return { type: "redirect", redirect };
}

export function createBreadcrumb(nodes: NavigationNode[]): string[] {
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
