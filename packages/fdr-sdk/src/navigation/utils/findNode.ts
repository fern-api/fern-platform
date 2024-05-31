import urljoin from "url-join";
import { SlugCollector } from "../SlugCollector";
import { FernNavigation } from "../generated";
import { NavigationNodeWithContent } from "../types/NavigationNode";
import { nodeHasContent } from "./nodeHasContent";

export type Node = Node.Found | Node.Redirect | Node.NotFound;

export declare namespace Node {
    interface Found {
        type: "found";
        node: NavigationNodeWithContent;
        sidebar: FernNavigation.SidebarRootNode;
        tab: FernNavigation.TabNode | undefined;
        version: FernNavigation.VersionNode | undefined;
        apiReference: FernNavigation.ApiReferenceNode | undefined;
        next: NavigationNodeWithContent | undefined;
        prev: NavigationNodeWithContent | undefined;
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
    const collector = SlugCollector.collect(root);
    const map = collector.getSlugMapWithParents();
    const found = map.get(slugToFind);
    if (found == null) {
        let maybeVersionNode: FernNavigation.RootNode | FernNavigation.VersionNode = root;
        for (const versionNode of collector.getVersionNodes()) {
            const versionSlug = urljoin(versionNode.slug);
            if (slugToFind.startsWith(versionSlug)) {
                maybeVersionNode = versionNode;
                break;
            }
        }

        const redirect = collector.followRedirect(maybeVersionNode);
        return { type: "notFound", redirect };
    }

    const sidebar = found.parents.find((node): node is FernNavigation.SidebarRootNode => node.type === "sidebarRoot");
    const version = found.parents.find((node): node is FernNavigation.VersionNode => node.type === "version");
    if (nodeHasContent(found.node) && sidebar != null) {
        return {
            type: "found",
            node: found.node,
            sidebar,
            tab: found.parents.findLast((node): node is FernNavigation.TabNode => node.type === "tab"),
            version,
            apiReference: found.parents.find(
                (node): node is FernNavigation.ApiReferenceNode => node.type === "apiReference",
            ),
            next: found.next,
            prev: found.prev,
        };
    }

    const redirectSlug = collector.followRedirect(found.node);

    if (redirectSlug == null) {
        if (found.node.type === "root") {
            return { type: "notFound", redirect: undefined };
        }

        const redirect = collector.followRedirect(version ?? root);
        return { type: "notFound", redirect };
    }

    return { type: "redirect", redirect: redirectSlug };
}
