import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { FernNavigation } from "../..";

export function followRedirect(
    nodeToFollow: FernNavigation.NavigationNode | undefined,
): FernNavigation.Slug | undefined {
    if (nodeToFollow == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(nodeToFollow)._visit<FernNavigation.Slug | undefined>({
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
        landingPage: (node) => node.slug,

        // nodes with overview
        apiPackage: (node) => (node.overviewPageId != null ? node.slug : followRedirects(node.children)),
        section: (node) => (node.overviewPageId != null ? node.slug : followRedirects(node.children)),
        apiReference: (node) => (node.overviewPageId != null ? node.slug : followRedirects(node.children)),

        // version is a special case where it should only consider it's first child (the first version)
        product: (node) => followRedirect(node.child),
        productgroup: (node) => followRedirect(node.children.filter((node) => !node.hidden)[0]),
        versioned: (node) => followRedirect(node.children.filter((node) => !node.hidden)[0]),
        unversioned: (node) => followRedirect(node.landingPage ?? node.child),
        tabbed: (node) => followRedirects(node.children),
        sidebarRoot: (node) => followRedirects(node.children),
        endpointPair: (node) => followRedirect(node.nonStream),
        root: (node) => followRedirect(node.child),
        version: (node) => followRedirect(node.child),
        tab: (node) => followRedirect(node.child),
        sidebarGroup: (node) => followRedirects(node.children),
    });
}

export function followRedirects(nodes: FernNavigation.NavigationNode[]): FernNavigation.Slug | undefined {
    for (const node of nodes) {
        // skip hidden nodes
        if (FernNavigation.hasMetadata(node) && node.hidden) {
            continue;
        }
        const redirect = followRedirect(node);
        if (redirect != null) {
            return redirect;
        }
    }
    return;
}
