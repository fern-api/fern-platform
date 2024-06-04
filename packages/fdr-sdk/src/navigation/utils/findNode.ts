import { noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";

import urljoin from "url-join";
import { NodeCollector } from "../NodeCollector";
import { FernNavigation } from "../generated";
import {
    NavigationNode,
    NavigationNodeNeighbor,
    NavigationNodePage,
    NavigationNodeWithMetadata,
    hasMetadata,
    isPage,
} from "../types";

export type Node = Node.Found | Node.Redirect | Node.NotFound;

export declare namespace Node {
    interface Found {
        type: "found";
        node: NavigationNodePage;
        breadcrumb: string[];
        root: FernNavigation.RootNode;
        versions: FernNavigation.VersionNode[];
        currentVersion: FernNavigation.VersionNode | undefined;
        currentTab: FernNavigation.TabNode | undefined;
        tabs: FernNavigation.TabChild[];
        sidebar: FernNavigation.SidebarRootNode;
        apiReference: FernNavigation.ApiReferenceNode | undefined;
        next: NavigationNodeNeighbor | undefined;
        prev: NavigationNodeNeighbor | undefined;
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
            if (!versionNode.default && slugToFind.startsWith(versionNode.slug)) {
                maybeVersionNode = versionNode;
                break;
            }
        }

        return { type: "notFound", redirect: maybeVersionNode.pointsTo };
    }

    const sidebar = found.parents.find((node): node is FernNavigation.SidebarRootNode => node.type === "sidebarRoot");
    const version = found.parents.find((node): node is FernNavigation.VersionNode => node.type === "version");
    if (isPage(found.node) && sidebar != null) {
        const rootChild = (version ?? root).child;
        return {
            type: "found",
            node: found.node,
            breadcrumb: createBreadcrumb(found.parents),
            root,
            versions: collector.getVersionNodes(),
            tabs: rootChild.type === "tabbed" ? rootChild.children : [],
            currentVersion: version,
            currentTab: found.parents.findLast((node): node is FernNavigation.TabNode => node.type === "tab"),
            sidebar,
            apiReference:
                found.parents.find((node): node is FernNavigation.ApiReferenceNode => node.type === "apiReference") ??
                (found.node.type === "apiReference" ? found.node : undefined),
            next: found.next,
            prev: found.prev,
        };
    }

    const redirect = hasPointsTo(found.node) ? found.node.pointsTo : version?.pointsTo ?? root.pointsTo;

    if (redirect == null || redirect === slugToFind) {
        return { type: "notFound", redirect: undefined };
    }

    return { type: "redirect", redirect };
}

function hasPointsTo(
    node: NavigationNodeWithMetadata,
): node is NavigationNodeWithMetadata & FernNavigation.WithRedirect {
    return (node as FernNavigation.WithRedirect).pointsTo != null;
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
            apiSection: (apiSection) => {
                breadcrumb.push(apiSection.title);
            },
            changelogEntry: noop,
            endpoint: noop,
            webSocket: noop,
            webhook: noop,
        });
    });

    return breadcrumb;
}
