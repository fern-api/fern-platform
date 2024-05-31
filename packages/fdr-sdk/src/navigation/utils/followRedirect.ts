import { FernNavigation } from "../generated";
import { NavigationNode } from "../types/NavigationNode";
import { visitNavigationNode } from "../visitors";

export function followRedirect(nodeToFollow: NavigationNode | undefined): FernNavigation.Slug | undefined {
    if (nodeToFollow == null) {
        return undefined;
    }
    return visitNavigationNode<FernNavigation.Slug | undefined>(nodeToFollow, {
        link: () => undefined,

        // leaf nodes
        page: (node) => node.slug,
        changelog: (node) => node.slug,
        changelogYear: (node) => node.slug,
        changelogMonth: (node) => node.slug,
        changelogEntry: (node) => node.slug,
        endpoint: (node) => node.slug,
        webSocket: (node) => node.slug,
        webhook: (node) => node.slug,

        // nodes with overview
        apiSection: (node) => (node.overviewPageId != null ? node.slug : followRedirects(node.children)),
        section: (node) => (node.overviewPageId != null ? node.slug : followRedirects(node.children)),
        apiReference: (node) => (node.overviewPageId != null ? node.slug : followRedirects(node.children)),

        // version is a special case where it should only consider it's first child (the first version)
        versioned: (node) => followRedirect(node.children[0]),
        tabbed: (node) => followRedirects(node.children),
        sidebarRoot: (node) => followRedirects(node.children),
        endpointPair: (node) => followRedirect(node.nonStream),
        root: (node) => followRedirect(node.child),
        version: (node) => followRedirect(node.child),
        tab: (node) => followRedirect(node.child),
        sidebarGroup: (node) => followRedirects(node.children),
    });
}

function followRedirects(nodes: NavigationNode[]): FernNavigation.Slug | undefined {
    let traversedFirst = false;
    for (const node of nodes) {
        if (traversedFirst) {
            // eslint-disable-next-line no-console
            console.error("First redirect path was not followed, this should not happen.");
        }
        const redirect = followRedirect(node);
        if (redirect != null) {
            return redirect;
        }
        traversedFirst = true;
    }
    return;
}
