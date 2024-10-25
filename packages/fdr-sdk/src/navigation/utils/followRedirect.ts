import { UnreachableCaseError } from "ts-essentials";
import { FernNavigation } from "../..";

export function followRedirect(
    nodeToFollow: FernNavigation.NavigationNode | undefined,
): FernNavigation.Slug | undefined {
    if (nodeToFollow == null) {
        return undefined;
    }

    if (FernNavigation.isPage(nodeToFollow)) {
        return nodeToFollow.slug;
    }

    switch (nodeToFollow.type) {
        case "link":
            return undefined;
        /**
         * Versioned and ProductGroup nodes are special in that they have a default child.
         */
        case "productgroup":
        case "versioned":
            return followRedirect([...nodeToFollow.children].sort(defaultFirst)[0]);
        case "apiReference":
        case "apiPackage":
        case "changelogMonth": // note: changelog month nodes don't exist yet as pages
        case "changelogYear": // note: changelog month nodes don't exist yet as pages
        case "endpointPair":
        case "product":
        case "root":
        case "section":
        case "sidebarRoot":
        case "sidebarGroup":
        case "tab":
        case "tabbed":
        case "unversioned":
        case "version":
            return followRedirects(FernNavigation.getChildren(nodeToFollow));
        default:
            throw new UnreachableCaseError(nodeToFollow);
    }
}

export function followRedirects(nodes: readonly FernNavigation.NavigationNode[]): FernNavigation.Slug | undefined {
    for (const node of nodes) {
        // skip hidden nodes, and nodes that are authed (authed=false if the user is already logged in)
        // TODO: the `authed: boolean` logic here is a bit convoluted and will cause confusion. We should revisit this.
        if (FernNavigation.hasMetadata(node) && (node.hidden || node.authed)) {
            continue;
        }

        const redirect = followRedirect(node);
        if (redirect != null) {
            return redirect;
        }
    }
    return;
}

function rank<T extends { default: boolean; hidden: boolean | undefined }>(node: T): number {
    return node.default && !node.hidden ? 1 : node.hidden ? -1 : 0;
}

function defaultFirst<T extends { default: boolean; hidden: boolean | undefined }>(a: T, b: T): number {
    return rank(b) - rank(a);
}
